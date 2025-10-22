import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import { requestorList } from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge } from '@mantine/core';
import { IconEdit, IconInfoCircle } from '@tabler/icons-react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import axios from 'axios';
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
    const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [totalPages, setTotalPages] = useState(1);


    // Columns mapping sesuai backend
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
            id: 'requestor_name',
            header: 'Requestor',
        },
        {
            accessorFn: row => row.full_name,
            id: 'full_name',
            header: 'Name',
        },
        {
            accessorFn: row => row.badge_no,
            id: 'badge_no',
            header: 'Employee ID',
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
            accessorFn: row => row.name_of_department,
            id: 'name_of_department',
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
            cell: info => (
                <div className="flex gap-2">
                    <Button
                        leftSection={<IconInfoCircle size={16} />}
                        color="blue"
                        onClick={() => router.push(`/user_management/request_detail/${info.getValue()}`)}
                    >
                        Details
                    </Button>
                    <Button
                        leftSection={<IconEdit size={16} />}
                        color="orange"
                        onClick={() => router.push(`/user_management/edit_request/${info.getValue()}`)}
                    >
                        Edit
                    </Button>
                </div>
            ),
        },
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
        // Prepare search
        const searchQuery = {};
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

            // Map FE sesuai backend
            setData(res.data.data.map(d => ({
                ...d,
                project_name: d.project?.project_name || '-',
                name_of_department: d.department?.name_of_department || '-',
                role_name: d.role?.role_name || '-',
            })));
            
            setTotalPages(res.data.total_pages);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);

    // ⚡ Trigger fetch saat komponen mount atau parameter berubah
    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h1 className="text-lg font-semibold text-blue-700">Request User List</h1>
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
