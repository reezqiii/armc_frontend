import Datatables from '@/components/custom/Datatables';
import { Button, Paper, Badge } from '@mantine/core';
import { useRouter } from 'next/router';
import { formatDate } from '@/lib/dateFormat';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import useEncrypt from '@/hooks/useEncrypt';
import axios from 'axios'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';


const HistoryLog = ({ logData, idRequest }) => {
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
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns = useMemo(() => [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
      size: 40,
    },
    {
      accessorFn: row => {
        const val = row.before;
        if (!val) return "-";

        if (typeof val === "object") {
          return JSON.stringify(val, null, 2);
        }

        try {
          const trimmed = String(val).trim();

          if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            return JSON.stringify(JSON.parse(trimmed), null, 2);
          }

          return trimmed;
        } catch {
          return String(val);
        }
      },
      id: "before",
      header: "Before",
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => {
        const val = row.after;
        if (!val) return "-";

        if (typeof val === "object") {
          return JSON.stringify(val, null, 2);
        }

        try {
          const trimmed = String(val).trim();

          if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            return JSON.stringify(JSON.parse(trimmed), null, 2);
          }

          return trimmed;
        } catch {
          return String(val);
        }
      },
      id: "after",
      header: "After",
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.full_name ?? row.user,
      id: 'full_name',
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
      cell: ({ row }) => formatDate(row.original.date, { showTime: true }),
    }
  ], []);

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
    const sort_by = sorting[0]?.id || "date";
    const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

    const filterObj = Object.fromEntries(
      columnFilters.map(f => [f.id, f.value])
    );

    const search = JSON.stringify({
      index: idRequest,
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
  }, [API_URL, pagination, sorting, columnFilters, user.token, idRequest]);

  useEffect(() => {
    if (!idRequest) return;
    getLogData();
  }, [getLogData, idRequest]);

  return (
    <Paper radius="md" withBorder shadow="xs" className="p-0 mt-4 overflow-hidden border-gray-200">
      <div className="bg-blue-600 shadow-sm">
        <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
          History Log
        </div>
      </div>

      {/* Konten Table */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <Datatables table={table} totalPages={totalPages} />
        </div>
      </div>
    </Paper>
  );
};

export default HistoryLog;
