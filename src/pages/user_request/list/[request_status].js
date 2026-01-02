import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { useRouter } from 'next/router';
import useEncrypt from "@/hooks/useEncrypt";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Paper, Badge, Button, Group, Text, Checkbox } from "@mantine/core";
import {
    IconFileText, IconClock, IconUserExclamation, IconUserCog,
    IconCircleCheck, IconRefresh, IconX, IconFileSpreadsheet,
    IconInfoCircle, IconEdit, IconSend, IconTrash, IconCheck, IconUser,
    IconListDetails, IconListLetters, IconUserPlus, IconUserCheck
} from "@tabler/icons-react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel
} from "@tanstack/react-table"; // Impor helper Anda
import { hasPermission } from '@/lib/permissionHelper';
import AdminStatusCell from '@/data/status/AdminStatusCell';
import RejectTimelineModal from '@/components/request/RejectTimelineModal';
import { formatDate } from '@/lib/dateFormat';


// Tambahkan import Modal jika belum ada
// import RejectTimelineModal from '@/components/custom/RejectTimelineModal';

// --- CONFIGURATION ---
const STATUS_CONFIG = {
    'all': {
        id: null,
        label: 'All User Request',
        icon: IconListLetters,
        color: 'blue',
        actions: ['detail']
    },
    'draft':
    {
        id: 0,
        label: 'Draft',
        icon: IconFileText,
        color: 'gray',
        actions: ['detail', 'update', 'cancel', 'submit_bulk']
    },
    'awaiting-hod-approval':
    {
        id: 1,
        label: 'Awaiting HOD Approval',
        icon: IconClock,
        color: 'yellow',
        actions: ['detail', 'update', 'cancel', 'approve_bulk']
    },
    'awaiting-lead-it-approval':
    {
        id: 3,
        label: 'Awaiting Lead IT Approval',
        icon: IconUserExclamation,
        color: 'yellow',
        actions: ['detail', 'update', 'cancel', 'approve_bulk']
    },
    'awaiting-it-manager-approval':
    {
        id: 5,
        label: 'Awaiting IT Manager Approval',
        icon: IconUserCog,
        color: 'yellow',
        actions: ['detail', 'update', 'cancel', 'approve_bulk']
    },
    'completed':
    {
        id: 7,
        label: 'Completed',
        icon: IconCircleCheck,
        color: 'green',
        actions: ['detail', 'admin_status']
    },
    'returned':
    {
        id: 8,
        label: 'Returned',
        icon: IconRefresh,
        color: 'orange',
        actions: ['detail', 'update', 'cancel']
    },
    'rejected-hod-approval':
    {
        id: 2,
        label: 'Rejected by HOD Approval',
        icon: IconX,
        color: 'red',
        actions: ['detail', 'view_reason']
    },
    'rejected-lead-it-approval':
    {
        id: 4,
        label: 'Rejected by Lead IT Approval',
        icon: IconX,
        color: 'red',
        actions: ['detail', 'view_reason']
    },
    'rejected-it-manager-approval':
    {
        id: 6,
        label: 'Rejected by IT Manager Approval',
        icon: IconX,
        color: 'red',
        actions: ['detail', 'view_reason']
    },
};

export default function RequestListDynamic({ request_status }) {
    const router = useRouter();
    const config = STATUS_CONFIG[request_status];

    const { user } = useUser();
    const API = useApi();
    const API_URL = API.API_URL;
    const { encrypt } = useEncrypt();

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [rowSelection, setRowSelection] = useState({});
    const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRejectData, setSelectedRejectData] = useState(null);

    const canApprove = useMemo(() => {
        if (!config || !user?.id) return false;

        if (config.id === 1) {
            return data.some(item => item.approval_hod_by?.id === user.id);
        }

        if (config.id === 3 && hasPermission(0)) return true;

        if (config.id === 5 && hasPermission(1)) return true;

        return false;
    }, [config?.id, data, user?.id]);

    const getData = useCallback(async () => {
        if (!config || !user?.token) return;
        const sort_by = sorting[0]?.id || "id_request";
        const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

        const filterObj = Object.fromEntries(columnFilters.map(f => [f.id, f.value]));
        const searchPayload = {
            ...(config.id !== null && { request_status: config.id }),
            status_active: 1,
            // Jika bukan Admin/IT (index 2), filter hanya data milik sendiri
            ...(config.id === 0 && { requestor_id: user.id }),
            ...filterObj
        };

        try {
            const res = await axios.post(
                `${API_URL}/requests/serverside_list?search=${encodeURIComponent(JSON.stringify(searchPayload))}&sort_by=${sort_by}&sort_order=${sort_order}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
                {}, { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setData(res.data.data);
            setTotalPages(res.data.total_pages);
        } catch (err) { console.error("API Error:", err); }
    }, [config, pagination, sorting, columnFilters, user, API_URL, canApprove]);

    useEffect(() => { getData(); }, [getData, request_status]);

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to cancel this request",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, cancel it!'
        });
        if (result.isConfirmed) {
            try {
                await axios.put(`${API_URL}/requests/cancel/${encrypt(String(id))}`, {}, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setData(prev => prev.filter(item => item.id_request !== id));
                Swal.fire('Success', 'Request canceled', 'success');
            } catch (err) { Swal.fire('Error', 'Failed to cancel', 'error'); }
        }
    };

    const handleBulkProcess = async (action) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const ids = selectedRows.map(r => r.original.id_request);

        if (ids.length === 0) return;

        const confirm = await Swal.fire({
            title: `${action === 'approve' ? 'Approve' : 'Reject'} ${ids.length} requests?`,
            icon: 'question', showCancelButton: true
        });

        if (!confirm.isConfirmed) return;

        let remarks = "";
        if (action === 'reject') {
            const { value } = await Swal.fire({ title: 'Rejection Reason', input: 'textarea', required: true });
            if (!value) return;
            remarks = value;
        }

        try {
            let endpoint = config.id === 1 ? "/requests/hod-approval/bulk" :
                config.id === 3 ? "/requests/lead-it-approval/bulk" :
                    "/requests/it-approval/bulk";

            await axios.put(`${API_URL}${endpoint}`, { ids, action, remarks }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            Swal.fire('Success', 'Requests processed', 'success');
            setRowSelection({});
            getData();
        } catch (err) { Swal.fire('Error', 'Failed to process bulk action', 'error'); }
    };

    const handleExportExcel = async () => {
        try {
            Swal.fire({ title: 'Preparing File...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const response = await axios.get(`${API_URL}/excel/export-list`, {
                params: {
                    search: JSON.stringify({ request_status: config.id }),
                    status: request_status
                },
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${config.label.replace(/\s+/g, '_')}_Requests.xlsx`);
            document.body.appendChild(link);
            link.click();
            Swal.close();
        } catch (err) { Swal.fire('Error', 'Export failed', 'error'); }
    };

    const handleReturn = async (id) => {
        Swal.fire({
            title: "Return for Revision?",
            text: "This request will be returned to the requestor for revision.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, Return",
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            try {
                const encryptedId = encrypt(String(id));

                const res = await axios.post(
                    `${API_URL}/requests/${encryptedId}/return`,
                    {},
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );

                Swal.fire("Success", "The request has been returned for revision.", "success");

                getData();

            } catch (err) {
                console.log("Axios Error:", err);
                Swal.fire("Error", err.response?.data?.message || "An error occurred.", "error");
            }
        });
    };

    const columns = useMemo(() => {
        const cols = [];
        // Checkbox hanya muncul jika status bukan "Completed" atau "Rejected"
        if (config?.actions.some(a => a.includes('bulk'))) {
            cols.push({
                id: "select",
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllPageRowsSelected()}
                        ref={el => {
                            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
                        }}
                        onChange={table.getToggleAllPageRowsSelectedHandler()}
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        ref={el => {
                            if (el) el.indeterminate = row.getIsSomeSelected();
                        }}
                        onChange={row.getToggleSelectedHandler()}
                    />
                ),
                size: 40,
            });
        }

        cols.push(
            {
                id: 'no',
                header: 'No',
                cell: ({ row }) =>
                    row.index + 1 + pagination.pageIndex * pagination.pageSize,
                size: 40,
            },
            {
                accessorFn: row => row.id_request,
                id: 'id_request',
                header: 'No Request',
                enableColumnFilter: true,
                enableSorting: true,
                cell: ({ row }) => `ITF14-${String(row.original.id_request).padStart(6, '0')}`,
            },
            {
                accessorFn: row => row.created_date,
                id: 'created_date',
                header: 'Request Date',
                enableColumnFilter: true,
                enableSorting: true,
                cell: ({ row }) => formatDate(row.original.created_date),
            },
            {
                accessorFn: row => row.requestor_name,
                id: 'requestor_name',
                header: 'Requestor',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.badge_no,
                id: 'badge_no',
                header: 'Badge ID',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.full_name,
                id: 'full_name',
                header: 'Full Name',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.department_name,
                id: 'department_name',
                header: 'Department',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.position_name,
                id: 'position_name',
                header: 'Position',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.project_name,
                id: 'project_name',
                header: 'Project',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.company_name,
                id: 'company_name',
                header: 'Company',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.email,
                id: 'email',
                header: 'Email',
                enableColumnFilter: true,
                enableSorting: true,
                cell: info => info.getValue(),
            },
            {
                accessorFn: row => row.type,
                id: 'type',
                header: 'Type',
                enableColumnFilter: true,
                enableSorting: true,
                cell: ({ row }) => (row.original.type === 1 ? 'External' : 'Internal'),
            },
            {
                id: 'request_status',
                header: 'Status',
                enableColumnFilter: false,
                enableSorting: true,
                cell: ({ row }) => {
                    const statusCode = row.original.request_status;

                    // 2. Mapping Status berdasarkan ID (Gunakan ini agar dinamis di page 'ALL')
                    const statusMap = {
                        0: { label: "Draft", color: "gray" },
                        1: { label: "Awaiting HOD Approval", color: "yellow" },
                        2: { label: "Rejected by HOD", color: "red" },
                        3: { label: "Awaiting Lead IT Approval", color: "yellow" },
                        4: { label: "Rejected by Lead IT", color: "red" },
                        5: { label: "Awaiting IT Manager Approval", color: "yellow" },
                        6: { label: "Rejected by IT Manager", color: "red" },
                        7: { label: "Completed", color: "green" },
                        8: { label: "Returned", color: "orange" },
                    };

                    const currentStatus = statusMap[statusCode] || { label: "Unknown", color: "gray" };

                    let rejectField = null;

                    if (statusCode === 2) {
                        rejectField = {
                            by: row.original.approval_hod_by?.full_name,
                            at: row.original.approval_hod_date_at,
                            reason: row.original.rejected_hod_remarks,
                        };
                    }

                    if (statusCode === 4) {
                        rejectField = {
                            by: row.original.approval_lead_it_by?.full_name,
                            at: row.original.approval_lead_date_at,
                            reason: row.original.rejected_lead_remarks,
                        };
                    }

                    if (statusCode === 6) {
                        rejectField = {
                            by: row.original.approval_it_hod_by?.full_name,
                            at: row.original.approval_it_date_at,
                            reason: row.original.rejected_it_remarks,
                        };
                    }

                    return (
                        <div className="flex flex-col items-center justify-center gap-1 w-full">
                            {/* PAKAI currentStatus.color dan label */}
                            <Badge color={currentStatus.color} variant="light" fullWidth={false}>
                                {currentStatus.label}
                            </Badge>

                            {rejectField && (
                                <Button
                                    size="compact-xs"
                                    variant="light"
                                    color="red"
                                    onClick={() => {
                                        setSelectedRejectData({
                                            status: currentStatus.label,
                                            rejected_by_name: rejectField.by,
                                            rejected_at: formatDate(row.original.created_date),
                                            rejected_reason: rejectField.reason
                                        });
                                        setModalOpen(true);
                                    }}
                                >
                                    View Reason
                                </Button>
                            )}
                        </div>
                    );
                }
            }
        );

        if (config?.actions.includes('admin_status')) {
            cols.push({
                id: 'request_admin',
                header: 'Admin Status',
                cell: ({ row }) => (
                    <AdminStatusCell
                        value={row.original.request_admin}
                        id_request={row.original.id_request}
                        API_URL={API_URL}
                        token={user.token}
                        setData={setData}
                    />
                )
            });
        }

        cols.push({
            id: 'actions', header: 'Action',
            enableColumnFilter: false,
            enableSorting: false,
            cell: ({ row }) => {
                const encryptedId = encrypt(String(row.original.id_request));
                const statusCode = row.original.request_status;

                const isEditableStatus = [3, 5, 7]; // status yang dibatasi tombolnya
                const hasPermissionToEdit = hasPermission(2);

                const showAllButtons = !isEditableStatus.includes(statusCode) || hasPermissionToEdit;

                return (
                    <Group justify="center">
                        <Button.Group>
                            <Button
                                size="xs"
                                color="blue"
                                leftSection={<IconInfoCircle size={14} />}
                                onClick={() => router.push(`/user_request/detail_req/${encryptedId}`)}
                            >
                                Details
                            </Button>

                            {config.actions.includes('update') && (
                                <Button
                                    size="xs"
                                    color="yellow"
                                    leftSection={<IconEdit size={14} />}
                                    onClick={() => router.push(`/user_request/edit_req/${encryptedId}`)}
                                >
                                    Update
                                </Button>
                            )}

                            {config.actions.includes('cancel') && (
                                <Button
                                    size="xs"
                                    color="red"
                                    leftSection={<IconX size={14} />}
                                    onClick={() => handleCancel(row.original.id_request)}
                                >
                                    Cancel
                                </Button>
                            )}

                            <Button
                                leftSection={<IconRefresh size={16} />}
                                color="orange"
                                size="xs"
                                onClick={() => handleReturn(request.id_request)}
                            >
                                Return
                            </Button>
                        </Button.Group>
                    </Group>
                );
            }
        });
        return cols;
    }, [config, pagination, API_URL, user.token, encrypt, router, rowSelection]);

    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
            sorting,
            pagination,
            rowSelection,
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        onRowSelectionChange: setRowSelection,
        enableRowSelection: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
    });

    if (!config) return <div className="p-10 text-center">Status Not Found</div>;

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6 px-4">
                <Paper radius="md" p="md" withBorder shadow="sm">
                    <div className="flex items-center justify-between border-b pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                {config && <config.icon size={22} />}
                            </div>
                            <div>
                                <h1 className="text-md font-extrabold text-blue-600 uppercase">{config?.label} List</h1>
                                <p className="text-xs text-gray-500">ITF14 - {config?.label}</p>
                            </div>
                        </div>
                    </div>

                    <Datatables table={table} totalPages={totalPages} />

                    <RejectTimelineModal
                        opened={modalOpen}
                        onClose={() => setModalOpen(false)}
                        data={selectedRejectData}
                    />

                    {Object.keys(rowSelection).length > 0 && (
                        <div className="flex justify-between items-center border-t pt-4 mt-4 bg-slate-50 p-3 rounded">
                            <Text size="sm" fw={600}>Selected {Object.keys(rowSelection).length} items</Text>
                            <Group>
                                {/* Tombol Submit Bulk (Hanya untuk Page Draft ID 0) */}
                                {config.id === 0 && (
                                    <Button color="green"
                                        size="xs"
                                        leftSection={<IconSend size={16} />}
                                        onClick={() => handleBulkProcess('submit')}>
                                        Submit to HOD Request
                                    </Button>
                                )}

                                {config.actions.includes('approve_bulk') && canApprove && (
                                    <>
                                        <Button
                                            size="xs"
                                            color="green"
                                            leftSection={<IconCheck size={14} />}
                                            onClick={() => handleBulkProcess('approve')}
                                        >
                                            Approve
                                        </Button>

                                        <Button
                                            size="xs"
                                            color="red"
                                            leftSection={<IconX size={14} />}
                                            onClick={() => handleBulkProcess('reject')}
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </Group>
                        </div>
                    )}
                </Paper>
            </div>
        </AuthLayout>
    );
}

export async function getStaticPaths() {
    const paths = Object.keys(STATUS_CONFIG).map(slug => ({ params: { request_status: slug } }));
    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    return { props: { request_status: params.request_status } };
}