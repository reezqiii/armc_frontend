import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge, Group } from '@mantine/core';
import { IconEdit, IconInfoCircle, IconRefresh, IconX, IconSend } from '@tabler/icons-react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import axios from 'axios';
import Swal from 'sweetalert2';
import useEncrypt from "@/hooks/useEncrypt";
import { useRouter } from 'next/router';
import { formatDateTime } from "@/lib/dateFormat";
import { hasPermission } from "@/lib/permissionHelper";
import { getRequestActionPermission } from "@/lib/requestStatus";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import RejectTimelineModal from '@/components/request/RejectTimelineModal';
import { getRequestStatus } from '@/lib/requestStatusList';

function RequestUserList() {
    const router = useRouter();
    const { user } = useUser();
    const API = useApi();
    const API_URL = API.API_URL;
    const { encrypt } = useEncrypt();

    const [data, setData] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [totalPages, setTotalPages] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRejectData, setSelectedRejectData] = useState(null);

    const handleCancel = async (id_request) => {
        const result = await Swal.fire({
            title: 'Are you sure you want to cancel this request?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!',
            cancelButtonText: 'No, keep it',
        });

        if (!result.isConfirmed) return;

        setIsCanceling(true);
        try {
            const encryptedId = encrypt(String(id_request));

            await axios.put(`${API_URL}/requests/cancel/${encryptedId}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            setData(prevData => prevData.filter(item => item.id_request !== id_request));

            Swal.fire({
                icon: 'success',
                title: 'Canceled!',
                text: 'The request has been marked as canceled.',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (err) {
            console.error("Error canceling request:", err);
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Failed to cancel the request. Please try again.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSubmitToHOD = async (id_request) => {
        const encryptedId = encrypt(String(id_request));

        const confirm = await Swal.fire({
            title: "Submit request to HOD?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        try {
            await axios.put(
                `${API_URL}/requests/${encryptedId}/submit-to-hod`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Request submitted to HOD.`,
                timer: 1500,
                showConfirmButton: false,
            });

            getData(); // refresh list
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: "Failed to submit request.",
            });
        }
    };

    const columns = useMemo(() => [
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
            cell: ({ row }) => formatDateTime(row.original.created_date, false),
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
            cell: ({ row }) => (row.original.type === 1 ? 'Public' : 'Login'),
        },
        {
            id: 'request_status',
            header: 'Status',
            accessorFn: row => row.request_status.name,
            cell: ({ row }) => {
                const statusCode = row.original.request_status;
                const status = getRequestStatus(statusCode);

                let rejectField = null;

                switch (statusCode) {
                    case 2: // Rejected by HOD
                        rejectField = {
                            by: row.original.approval_hod_by?.full_name,
                            at: row.original.approval_hod_date_at,
                            reason: row.original.rejected_hod_remarks,
                        };
                        break;

                    case 4: // Rejected by Lead IT
                        rejectField = {
                            by: row.original.approval_lead_it_by?.full_name,
                            at: row.original.approval_lead_date_at,
                            reason: row.original.rejected_lead_remarks,
                        };
                        break;

                    case 6: // Rejected by IT Manager
                        rejectField = {
                            by: row.original.approval_it_hod_by?.full_name,
                            at: row.original.approval_it_date_at,
                            reason: row.original.rejected_it_remarks,
                        };
                        break;

                    default:
                        rejectField = null;
                }

                if (rejectField) {
                    return (
                        <div className="flex flex-col gap-1">
                            <Badge color={status.color} variant="light">
                                {status.label}
                            </Badge>

                            <Button
                                size="xs"
                                variant="light"
                                color="red"
                                onClick={() => {
                                    setSelectedRejectData({
                                        status,
                                        rejected_by_name: rejectField.by,
                                        rejected_at: formatDateTime(rejectField.at),
                                        rejected_reason: rejectField.reason,
                                    });
                                    setModalOpen(true);
                                }}
                            >
                                View Reason
                            </Button>
                        </div>
                    );
                }

                return (
                    <Badge color={status.color} variant="light">
                        {status.label}
                    </Badge>
                );
            }
        },
        {
            accessorFn: row => row.id_request,
            id: 'action',
            header: 'Action',
            enableColumnFilter: false,
            enableSorting: true,
            cell: ({ row }) => {
                const request = row.original;
                const encryptedId = encrypt(String(row.original.id_request));
                const status = row.original.request_status.name;
                const editableStatuses = ["Draft", "Pending by HOD Req"];
                const canEditCancel = hasPermission(2) || editableStatuses.includes(status);
                const {
                    canSubmitToHOD,
                    canReturn,
                } = getRequestActionPermission(status, hasPermission(2));

                return (
                    <Group justify="center">
                        <Button.Group>
                            {/* details button */}
                            <Button
                                leftSection={<IconInfoCircle size={16} />}
                                color="blue"
                                size="xs"
                                onClick={() =>
                                    router.push(`/user_request/detail_req/${encryptedId}`)
                                }
                            >
                                Details
                            </Button>

                            {canEditCancel && (
                                <Button
                                    leftSection={<IconEdit size={16} />}
                                    color="yellow"
                                    size="xs"
                                    onClick={() =>
                                        router.push(`/user_request/edit_req/${encryptedId}`)
                                    }
                                >
                                    Update
                                </Button>
                            )}

                            {canSubmitToHOD && (
                                <Button
                                    leftSection={<IconSend size={16} />}
                                    color="green"
                                    size="xs"
                                    onClick={() => handleSubmitToHOD(request.id_request)}
                                >
                                    Submit to HOD
                                </Button>
                            )}

                            {canEditCancel && (
                                <Button
                                    leftSection={<IconX size={16} />}
                                    color="red"
                                    size="xs"
                                    onClick={() => handleCancel(row.original.id_request)}
                                >
                                    Cancel
                                </Button>
                            )}

                            {canReturn && (
                                <Button
                                    leftSection={<IconRefresh size={16} />}
                                    color="orange"
                                    size="xs"
                                    onClick={() => handleReturn(request.id_request)}
                                >
                                    Return
                                </Button>
                            )}
                        </Button.Group>
                    </Group>
                );
            }
        }
    ], [data, encrypt, isDeleting, pagination.pageIndex, pagination.pageSize, router]);

    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: {
            columnFilters,
            sorting,
            pagination,
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualSorting: true,
        manualFiltering: true,
        manualPagination: true,
    });

    const getData = useCallback(async () => {
        const searchQuery = {
            status_active: 1,
            // requestor_id: user.id
        };

        columnFilters.forEach(filter => {
            if (filter.value != null && filter.value !== "") {
                searchQuery[filter.id] = filter.value;
            }
        });

        const filterParams =
            searchQuery && Object.keys(searchQuery).length > 0
                ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
                : "";

        const sort =
            sorting && sorting.length > 0
                ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
                : "";

        console.log("Filter params sent:", filterParams);


        try {
            const { data } = await axios.post(
                `${API_URL}/requests/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setData(data.data);
            setTotalPages(data.total_pages);
        } catch (err) {
            console.error("Error fetching data:", err);
        }

    }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h1 className="text-xl font-bold text-blue-500">Request User List</h1>
                        </div>
                        <div className="overflow-x-auto">
                            <Datatables table={table} totalPages={totalPages} />
                        </div>
                    </Paper>
                </div>
            </div>
            <RejectTimelineModal
                opened={modalOpen}
                onClose={() => setModalOpen(false)}
                data={selectedRejectData || {}}
            />
        </AuthLayout>
    );
}

RequestUserList.title = "Request User List";
export default RequestUserList
