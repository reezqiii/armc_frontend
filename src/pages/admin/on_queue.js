import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import { requestorList } from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge } from '@mantine/core';
import { IconInfoCircle, IconEdit, IconX } from '@tabler/icons-react';
import axios from 'axios';
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
import { formatDate } from "@/lib/dateFormat";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';

export default function CompletedRequestList() {
    CompletedRequestList.title = "Completed Request List";

    const router = useRouter();
    const { user } = useUser();
    const API = useApi();
    const API_URL = API.API_URL;

    const [data, setData] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [savedFilter, setSavedFilter] = useState({})
    const [isCanceling, setIsCanceling] = useState(false);
    const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [columnFilters, setColumnFilters] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    function AdminStatusCell({ value: initialValue, id_request, API_URL, token, setData }) {
        const [value, setValue] = React.useState(initialValue ?? 0);
        const [loading, setLoading] = React.useState(false);

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
            await axios.put(`${API_URL}/requests/cancel/${id_request}`, {}, {
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

    const columns = useMemo(() => [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
            size: 40,
        },
        {
            accessorFn: row => row.id_request,
            id: 'no_request',
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
            id: 'status',
            header: 'Status',
            cell: () => <Badge color="green">Completed</Badge>,
        },
        {
            accessorFn: row => row.request_admin,
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
            ),
        },
        {
            accessorFn: row => row.id_request,
            id: 'action',
            header: 'Action',
            cell: ({ row }) => (
                <div className="flex flex-col gap-2">
                    <Button
                        leftSection={<IconInfoCircle size={16} />}
                        color="blue"
                        fullWidth
                        onClick={() => router.push(`/user_request/detail_req/${row.original.id_request}`)}
                    >
                        Details
                    </Button>

                    <Button
                        leftSection={<IconEdit size={16} />}
                        color="orange"
                        fullWidth
                        onClick={() => router.push(`/user_request/edit_req/${row.original.id_request}`)}
                    >
                        Edit
                    </Button>

                    <Button
                        leftSection={<IconX size={16} />}
                        color="red"
                        fullWidth
                        onClick={() => handleCancel(row.original.id_request)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                </div>
            ),
        },
    ], [pagination.pageIndex, pagination.pageSize]);

    const getData = useCallback(async () => {
        try {
            const search = JSON.stringify({ request_status: 7 });
            const res = await axios.post(
                `${API_URL}/requests/serverside_list?search=${encodeURIComponent(search)}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setData(res.data.data);
            setTotalPages(res.data.total_pages);
        } catch (err) {
            console.error("Error fetching pending HOD data:", err);
        }
    }, [API_URL, pagination, user.token]);


    useEffect(() => {
        getData();
    }, [getData]);

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

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h1 className="text-xl font-bold text-blue-500">Completed Request List</h1>
                        </div>
                        <div className="overflow-x-auto">
                            <Datatables table={table} totalPages={totalPages} />
                        </div>
                    </Paper>
                </div>
            </div>
        </AuthLayout>
    );
}
