import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { requestorList } from '@/data/sidebar/RequestorList'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select } from '@mantine/core'
import { IconPlaylistAdd, IconEdit, IconInfoCircle } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

export default function RequestUserList() {
    RequestUserList.title = "Request User List"
    const router = useRouter();
    const { user } = useUser();
    const API = useApi();
    const API_URL = API.API_URL;
    const [display, setDisplay] = useState(false);
    const [data, setData] = useState([]);
    const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalPages, setTotalPages] = useState(1);

    // ✅ Gunakan const, bukan return
    const columns = useMemo(() => [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => {
                const rowNumber = row.index + 1 + (pagination.pageIndex * pagination.pageSize);
                return rowNumber;
            },
            size: 40,
        },
        {
            accessorFn: (row) => row.no_request,
            id: "no_request",
            header: "No Request",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },

        {
            accessorFn: (row) => row.req_by,
            id: "requestor_by",
            header: "Requestor",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.request_date,
            id: "request_date",
            header: "Request Date",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.req_name,
            id: "requestor_name",
            header: "Name",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.badge_no,
            id: "badge_no",
            header: "Badge No",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.email,
            id: "email",
            header: "Email",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },

        {
            accessorFn: (row) => row.department_name,
            id: "department",
            header: "Department",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },

        {
            accessorFn: (row) => row.remarks,
            id: "remarks",
            header: "Remarks",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.status_request,
            id: "status_request",
            header: "Status Request",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },
        {
            accessorFn: (row) => row.id,
            id: "action",
            header: "Action",
            enableColumnFilter: false,
            cell: (info) => (
                <div className="flex gap-2">
                    <Button
                        leftSection={<IconInfoCircle size={16} />}
                        color="blue"
                        onClick={() =>
                            router.push(`/user_management/request_detail/${info.getValue()}`)
                        }
                    >
                        Details
                    </Button>

                    <Button
                        leftSection={<IconEdit size={16} />}
                        color="orange"
                        onClick={() =>
                            router.push(`/user_management/edit_request/${info.getValue()}`)
                        }
                    >
                        Edit
                    </Button>
                </div>
            ),
        },
    ], [router, pagination]);

    // Setup react-table
    const table = useReactTable({
        data,
        columns, // ✅ sekarang columns terdefinisi
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

    // Fungsi getData
    const getData = useCallback(async () => {
        const searchQuery = {};
        columnFilters.forEach((filter) => {
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

        try {
            const { data } = await axios.post(
                `${API_URL}/api/pcms_mc_template/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );

            setData(data.data);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [API_URL, columnFilters, pagination.pageIndex, pagination.pageSize, sorting, user.token]);

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="py-6">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b pb-2 mb-3">
                            <h1 className="text-lg font-semibold text-blue-700">
                                Request User List
                            </h1>
                        </div>

                        {/* Datatable */}
                        <div className="overflow-x-auto">
                            <Datatables table={table} totalPages={totalPages} />
                        </div>
                    </Paper>
                </div>
            </div>
        </AuthLayout>
    );

}
