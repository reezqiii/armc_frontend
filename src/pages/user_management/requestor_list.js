import Datatables from '@/components/custom/Datatables'
import AuthLayout from '@/components/layout/authLayout'
import { administratorList } from '@/data/sidebar/administratorList'
import useApi from '@/hooks/useApi'
import useUser from '@/store/useUser'
import { Button, Paper, Checkbox, Select } from '@mantine/core'
import { useDebouncedState } from '@mantine/hooks'
import { IconPlaylistAdd, IconEdit } from '@tabler/icons-react'
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'
import axios from 'axios'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo, useState } from 'react'

RfiSubmission.title = "RFI Production"
export default function RfiSubmission() {
    const router = useRouter()
    const { user } = useUser()

    console.log(user)
    const API = useApi()
    const API_URL = API.API_URL
    const [display, setDisplay] = useState(false)
    const [data, setData] = useState([])
    const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [totalPages, setTotalPages] = useState(1);

    const columns = useMemo(() => [
        {
            id: "no",
            header: "No",
            cell: ({ row }) => {
                // Hitung nomor urut berdasarkan index row + offset halaman
                const rowNumber = row.index + 1 + (pagination.pageIndex * pagination.pageSize);
                return rowNumber;
            },
            size: 40,
        },

        {
            accessorFn: (row) => row.project_name,
            id: "created_date",
            header: "Created Date",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue()
        },

        {
            accessorFn: (row) => row.project_name,
            id: "full_name",
            header: "Full Name",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue()
        },

        {
            accessorFn: (row) => row.company_name,
            id: "badge_no",
            header: "Badge No",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue()
        },

        {
            accessorFn: (row) => row.drawing_no,
            id: "department",
            header: "Department",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },

        {
            accessorFn: (row) => row.event_id,
            id: "project_id",
            header: "Project ID",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue(),
        },

        {
            accessorFn: (row) => row.tag_number,
            id: "request_type",
            header: "Request Type",
            enableColumnFilter: true,
            enableSorting: true,
            cell: (info) => info.getValue()
        },

        {
            accessorFn: (row) => row.id,
            id: 'id',
            header: 'Action',
            enableColumnFilter: false,
            cell: (info) => (
                <Button
                    leftSection={<IconEdit />}
                    color="orange"
                    onClick={() => router.push('/master_data_new/master_data_subsystem/edit_subsystem/' + info.getValue())}
                >
                    Edit
                </Button>
            ),
        },
    ], [router]);



    // Setup react-table
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

    // Fungsi getData dibungkus dengan useCallback agar stabil dan bisa dipakai di useEffect dan handleClear
    const getData = useCallback(async () => {
        const searchQuery = {};
        columnFilters.forEach((filter) => {
            if (filter.value != null && filter.value !== "") {
                searchQuery[filter.id] = filter.value;
            }
        });
        console.log("Search query:", searchQuery);

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
        <AuthLayout sidebarList={administratorList}>
            <div className='py-6'>
                <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
                    <Paper radius="sm" mt="md" style={{ position: 'relative' }} withBorder>
                        <div className="px-4 py-2 text-right space-x-2">
                            <h1 className='text-center font-bold text-xl mt-2'>Request Account</h1>
                            <Button onClick={() => router.push("")}
                                leftSection={<IconPlaylistAdd />} >Create Request Account</Button>
                            {/* <Button onClick={downloadExcel}> Download Excel</Button>
              <Button onClick={downloadPdf}> Download PDF</Button> */}
                        </div>
                        <div className="p-4 overflow-x-auto">
                             <Datatables table={table} totalPages={totalPages} />
                        </div>
                    </Paper>
                </div>
            </div>
        </AuthLayout>
    );
}
