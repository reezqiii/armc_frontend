import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge, Group } from '@mantine/core';
import { IconInfoCircle, IconEdit, IconX, IconRefresh, IconCircleCheck, IconFileSpreadsheet } from '@tabler/icons-react';
import axios from 'axios';
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
import { hasPermission } from "@/lib/permissionHelper";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import useEncrypt from '@/hooks/useEncrypt';
import { getRequestStatus } from '@/lib/requestStatusList';

function CompletedRequest() {
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
    const permissions = user.permissions || {};
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    function AdminStatusCell({ value: initialValue, id_request, API_URL, token, setData, permissions }) {
        const [value, setValue] = React.useState(initialValue ?? 0);
        const [loading, setLoading] = React.useState(false);

        const allowed = hasPermission(2);
        if (!allowed) {
            return (
                <span>
                    {value === 0
                        ? "On Queue"
                        : value === 1
                            ? "On Progress"
                            : "Completed"}
                </span>
            );
        }

        const handleChange = async (e) => {
            const newValue = parseInt(e.target.value);
            setValue(newValue);
            setLoading(true);

            try {
                await axios.patch(
                    `${API_URL}/requests/${id_request}/admin-status`,
                    { request_admin: newValue },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setData(prevData =>
                    prevData.map(item =>
                        item.id_request === id_request ? { ...item, request_admin: newValue } : item
                    )
                );
            } catch (error) {
                console.error(error);
                setValue(initialValue ?? 0);
            } finally {
                setLoading(false);
            }
        };

        return (
            <select
                value={value}
                onChange={handleChange}
                disabled={loading}
                className="border border-gray-300 rounded-md text-sm p-1 bg-white"
            >
                <option value={0}>On Queue</option>
                <option value={1}>On Progress</option>
                <option value={2}>Completed</option>
            </select>
        );
    }

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

    const handleExportExcel = async () => {
        const sort_by = sorting[0]?.id || "id_request";
        const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

        const filterObj = Object.fromEntries(
            columnFilters.map(f => [f.id, f.value])
        );

        const searchParams = JSON.stringify({
            request_status: 7,
            ...filterObj
        });

        try {
            Swal.fire({
                title: 'Preparing your file...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const response = await axios.get(`${API_URL}/excel/export-list`, {
                params: {
                    search: searchParams,
                    sort_by: sort_by,
                    sort_order: sort_order,
                    status: 'completed',
                },
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            link.setAttribute('download', `Completed_Requests_${new Date().getTime()}.xlsx`);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.close();
        } catch (err) {
            console.error("Export Error:", err);
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Something went wrong while generating the Excel file.',
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
            accessorFn: row => row.request_status.name,
            id: 'request_status',
            header: 'Status',
            enableColumnFilter: false,
            enableSorting: true,
            cell: ({ row }) => {
                const status = getRequestStatus(row.original.request_status);

                return (
                    <Badge color={status.color} variant="light">
                        {status.label}
                    </Badge>
                );
            }
        },
        {
            accessorFn: row => row.request_admin,
            id: 'request_admin',
            header: 'Admin Status',
            enableColumnFilter: false,
            enableSorting: true,
            cell: ({ row }) => (
                <AdminStatusCell
                    value={row.original.request_admin}
                    id_request={row.original.id_request}
                    API_URL={API_URL}
                    token={user.token}
                    setData={setData}
                    permissions={permissions}
                />
            )
        },
        {
            accessorFn: row => row.id_request,
            id: 'action',
            header: 'Action',
            enableColumnFilter: false,
            enableSorting: false,
            cell: ({ row }) => {
                const request = row.original;
                const encryptedId = encrypt(String(request.id_request));

                return (
                    <Group justify="center">
                        <Button.Group>
                            {/* details button */}
                            <Button
                                leftSection={<IconInfoCircle size={16} />}
                                color="blue"
                                size="xs"
                                onClick={() => router.push(`/user_request/detail_req/${encryptedId}`)}
                            >
                                Details
                            </Button>

                            {hasPermission(2) && (
                                <>
                                    <Button
                                        leftSection={<IconEdit size={16} />}
                                        color="yellow"
                                        size="xs"
                                        onClick={() => router.push(`/user_request/edit_req/${encryptedId}`)}
                                    >
                                        Update
                                    </Button>

                                    <Button
                                        leftSection={<IconX size={16} />}
                                        color="red"
                                        size="xs"
                                        onClick={() => handleCancel(request.id_request)}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        leftSection={<IconRefresh size={16} />}
                                        color="orange"
                                        size="xs"
                                        onClick={() => handleReturn(request.id_request)}
                                    >
                                        Return
                                    </Button>
                                </>
                            )}
                        </Button.Group>
                    </Group>
                );
            }
        }
    ], [encrypt, isDeleting, pagination.pageIndex, pagination.pageSize, router, user.permissions]);

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
            request_status: 7,
            // is_returned: false,
            ...(!hasPermission(2) && { requestor_id: user.id }),
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
            console.error("Error fetching draft data:", err);
        }
    }, [API_URL, pagination, sorting, columnFilters, user.token, permissions]);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper
                        radius="md"
                        shadow="sm"
                        withBorder
                        className="p-5 bg-white"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                    <IconCircleCheck size={22} />
                                </div>

                                <div>
                                    <h1 className="text-md font-extrabold text-blue-600 uppercase">
                                        Completed Request List
                                    </h1>
                                    <p className="text-xs text-gray-500">
                                        Successfully completed user requests
                                    </p>
                                </div>
                            </div>

                            {/* Tombol Export Excel di Header */}
                            <Button
                                color="green"
                                size="sm"
                                leftSection={<IconFileSpreadsheet size={16} />}
                                onClick={handleExportExcel}
                            >
                                Export Excel
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Datatables table={table} totalPages={totalPages} />
                        </div>
                    </Paper>
                </div>
            </div>
        </AuthLayout>
    );
}

CompletedRequest.title = "Completed Request";
export default CompletedRequest;
