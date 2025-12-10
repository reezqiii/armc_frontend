import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge } from '@mantine/core';
import { IconInfoCircle, IconEdit, IconX, IconCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'axios';
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
import { formatDateTime } from "@/lib/dateFormat";
import { hasPermission } from "@/lib/permissionHelper";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import useEncrypt from '@/hooks/useEncrypt';

export default function ITPendingList() {
    ITPendingList.title = "Pending IT Manager List";

    const router = useRouter();
    const { user } = useUser();
    const API = useApi();
    const API_URL = API.API_URL;
    const { encrypt } = useEncrypt();

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [savedFilter, setSavedFilter] = useState({})
    const [isCanceling, setIsCanceling] = useState(false);
    const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const [columnFilters, setColumnFilters] = useState([]);
    const canApprove = hasPermission(1);
    const [permissions, setPermissions] = useState({
        approvalLeadIt: [],
        approvalItManager: [],
        itAction: []
    });
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });


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

    const handleSubmitMultipleITHOD = async (action) => {

        if (!canApprove) {
            Swal.fire("Forbidden", "You do not have permission to approve as IT Manager", "error");
            return;
        }

        const selectedIds = table
            .getSelectedRowModel()
            .rows
            .map(row => row.original.id_request);

        if (selectedIds.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Selection',
                text: 'Please select at least one request.',
            });
            return;
        }

        const confirm = await Swal.fire({
            title: `${action === 'approve'
                ? 'Approve'
                : 'Reject'
                } ${selectedIds.length} selected request(s)?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'Cancel',
        });

        if (!confirm.isConfirmed) return;

        let remarks = "";
        if (action === "reject") {
            const { value } = await Swal.fire({
                title: "Reason for Rejection",
                input: "textarea",
                inputPlaceholder: "Enter your reason...",
                showCancelButton: true,
            });

            if (!value) {
                Swal.fire("Cancelled", "You must provide a reason.", "info");
                return;
            }

            remarks = value;
        }

        try {
            await Promise.all(
                selectedIds.map(id => {
                    const encryptedId = encrypt(String(id));

                    return axios.put(
                        `${API_URL}/requests/${encryptedId}/it-approval`,
                        { action, remarks },
                        { headers: { Authorization: `Bearer ${user.token}` } }
                    );
                })
            );

            setData(prev => prev.filter(item => !selectedIds.includes(item.id_request)));

            table.resetRowSelection();

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `${selectedIds.length} request(s) processed.`,
                timer: 1500,
                showConfirmButton: false,
            });

        } catch (err) {
            console.error("ITHOD bulk error:", err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to process selected requests.',
            });
        }
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

    const columns = useMemo(() => [
        {
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
        },
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
            cell: ({ row }) => formatDateTime(row.original.created_date),
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
            id: 'status',
            header: 'Status',
            enableColumnFilter: false,
            enableSorting: true,
            cell: () => <Badge color="yellow">Pending by IT Manager</Badge>,
        },
        {
            accessorFn: row => row.id_request,
            id: 'action',
            header: 'Action',
            enableColumnFilter: false,
            enableSorting: true,
            cell: ({ row }) => {
                const request = row.original;
                const encryptedId = encrypt(String(request.id_request));

                return (
                    <div className="flex flex-col gap-2">
                        <Button
                            leftSection={<IconInfoCircle size={16} />}
                            color="blue"
                            fullWidth
                            onClick={() => router.push(`/user_request/detail_req/${encryptedId}`)}
                        >
                            Details
                        </Button>

                        {hasPermission(2) && (
                            <>
                                <Button
                                    leftSection={<IconEdit size={16} />}
                                    color="orange"
                                    fullWidth
                                    onClick={() => router.push(`/user_request/edit_req/${encryptedId}`)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    leftSection={<IconX size={16} />}
                                    color="red"
                                    fullWidth
                                    onClick={() => handleCancel(request.id_request)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    leftSection={<IconRefresh size={16} />}
                                    color="yellow"
                                    fullWidth
                                    onClick={() => handleReturn(request.id_request)}
                                >
                                    Return
                                </Button>
                            </>
                        )}
                    </div>
                );
            }
        }
    ], [canApprove, encrypt, isDeleting, pagination.pageIndex, pagination.pageSize, router]);

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

    const getData = useCallback(async () => {
        const sort_by = sorting[0]?.id || "id_request";
        const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

        const filterObj = Object.fromEntries(
            columnFilters.map(f => [f.id, f.value])
        );

        const search = JSON.stringify({
            request_status: 5,
            // requestor_id: user.id,
            ...filterObj
        });

        try {
            const res = await axios.post(
                `${API_URL}/requests/serverside_list?search=${encodeURIComponent(search)}&sort_by=${sort_by}&sort_order=${sort_order}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setData(res.data.data);
            setTotalPages(res.data.total_pages);
        } catch (err) {
            console.error("❌ Error fetching draft data:", err);
        }
    }, [API_URL, pagination, sorting, columnFilters, user.token]);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">

                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h1 className="text-xl font-bold text-blue-500">
                                Pending IT Manager Request List
                            </h1>
                        </div>

                        <div className="overflow-x-auto">
                            <Datatables table={table} totalPages={totalPages} />
                        </div>

                        <div className="flex justify-between items-center border-t pt-3 mt-4">

                            <span className="text-sm text-gray-700">
                                Selected: {table.getSelectedRowModel().rows.length}
                            </span>

                            {canApprove && (
                                <div className="flex gap-2">
                                    <Button
                                        leftSection={<IconCheck size={16} />}
                                        color="green"
                                        onClick={() => handleSubmitMultipleITHOD("approve")}>
                                        Approve
                                    </Button>
                                    <Button
                                        leftSection={<IconX size={16} />}
                                        color="red"
                                        onClick={() => handleSubmitMultipleITHOD("reject")}>
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Paper>
                </div>
            </div>
        </AuthLayout>
    );
}
