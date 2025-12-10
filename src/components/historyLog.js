import Datatables from '@/components/custom/Datatables';
import { Button, Paper, Badge } from '@mantine/core';
import { useRouter } from 'next/router';
import { formatDateTime } from "@/lib/dateFormat";
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import useEncrypt from '@/hooks/useEncrypt';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';


const HistoryLog = ({ logData }) => {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();
  const [data, setData] = useState(logData || []);
  const [totalPages, setTotalPages] = useState(1);

  const [sorting, setSorting] = useState([{ id: "date", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [idApplication, setIdApplication] = useState(null);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // ========================= TABLE COLUMNS =========================
  const columns = useMemo(() => [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) =>
        row.index + 1 + pagination.pageIndex * pagination.pageSize,
      size: 40,
    },
    {
      accessorFn: row => row.table,
      id: "table",
      header: "Table",
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.index,
      id: 'index',
      header: 'Index',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.before ? JSON.stringify(JSON.parse(row.before), null, 2) : '-',
      id: "before",
      header: "Before",
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.after ? JSON.stringify(JSON.parse(row.after), null, 2) : '-',
      id: "after",
      header: "After",
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.user,
      id: 'user',
      header: 'User',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.date,
      id: "date",
      header: "Date",
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => formatDateTime(row.original.date),
    },
    {
      accessorFn: row => {
        switch (row.type) {
          case 1: return "Update";
          case 2: return "Insert";
          case 3: return "Delete";
          default: return row.type;
        }
      },
      id: "type",
      header: "Type",
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },

  ], []);

  // ========================= TABLE DATA =========================
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

  const getLogData = useCallback(async () => {
     if (!idApplication) return;
    const sort_by = sorting[0]?.id || "date";
    const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

    const filterObj = Object.fromEntries(
      columnFilters.map(f => [f.id, f.value])
    );

    const search = JSON.stringify({
      id_application: idApplication, 
      ...filterObj
    });

    try {
      const res = await axios.post(
        `${API_URL}/log_portal/serverside_list?search=${encodeURIComponent(search)}&sort_by=${sort_by}&sort_order=${sort_order}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setData(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Error fetching log data:", err);
    }
  }, [API_URL, pagination, sorting, columnFilters, user.token]);

  useEffect(() => {
    getLogData();
  }, [getLogData, idApplication]);

  return (
    <Paper radius="sm" withBorder shadow="xs" className="p-4 mt-4">
      <label className="font-medium mb-1 text-gray-800 text-xl">
        History Log
      </label>

      <div className="overflow-x-auto mt-3">
        <Datatables table={table} totalPages={totalPages} />
      </div>
    </Paper>
  );
};

export default HistoryLog;
