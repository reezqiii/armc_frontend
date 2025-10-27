import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import { requestorList } from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge } from '@mantine/core';
import { IconEdit, IconInfoCircle, IconTrash, IconX } from '@tabler/icons-react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export default function RequestUserList() {
    RequestUserList.title = "Request User List";

    const router = useRouter();
    const { user } = useUser();
    const API = useApi();
    const API_URL = API.API_URL;

    const [data, setData] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [totalPages, setTotalPages] = useState(1);
    const [isCanceling, setIsCanceling] = useState(false);

    // 🔹 Handle Cancel Function 
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

    // Columns mapping 
    const columns = useMemo(() => [
        {
            id: 'no',
            header: 'No',
            cell: ({ row }) =>
                row.index + 1 + pagination.pageIndex * pagination.pageSize,
            size: 40,
        },
        {
            accessorFn: row => row.created_date,
            id: 'created_date',
            header: 'Request Date',
        },
        {
            accessorFn: row => row.requestor_name,
            id: 'requestor',
            header: 'Requestor',
        },
        {
            accessorFn: row => row.full_name,
            id: 'full_name',
            header: 'Full Name',
        },
        {
            accessorFn: row => row.badge_no,
            id: 'badge_no',
            header: 'Badge ID',
        },
        {
            accessorFn: row => row.email,
            id: 'email',
            header: 'Email',
        },
        {
            accessorFn: row => row.project_name,
            id: 'project_name',
            header: 'Project',
        },
        {
            accessorKey: 'department_name',
            header: 'Department',
        },
        {
            accessorFn: row => row.role_name,
            id: 'role_name',
            header: 'Role',
        },
        {
            accessorFn: row => row.request_status.name,
            id: 'request_status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.request_status.name;
                const colorMap = {
                    'Draft': 'gray',
                    'Pending HOD': 'yellow',
                    'Reject HOD': 'red',
                    'Pending IT': 'yellow',
                    'Reject IT': 'red',
                    'Completed': 'green',
                };

                return <Badge color={colorMap[status] || 'gray'}>{status}</Badge>;
            },
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
        }
    ], [pagination.pageIndex, pagination.pageSize, router]);

    const table = useReactTable({
        data,
        columns,
        filterFns: {},
        state: { columnFilters, sorting, pagination },
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
        const searchQuery = { status_active: 1 };

        columnFilters.forEach(filter => {
            if (filter.value != null && filter.value !== "") {
                searchQuery[filter.id] = filter.value;
            }
        });

        const filterParams = Object.keys(searchQuery).length > 0
            ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
            : "";

        const sort = sorting.length > 0
            ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
            : "";

        try {
            const res = await axios.post(
                `${API_URL}/requests/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
                {},
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            setData(res.data.data);

            setTotalPages(res.data.total_pages);
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
        </AuthLayout>
    );
}
