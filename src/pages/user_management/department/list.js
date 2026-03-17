import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios from "axios";
import { Button, Group, Paper } from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Head from "next/head";
import { formatDate } from "@/lib/dateFormat";
import useSwal from "@/hooks/useSwal";
import userList from "@/data/sidebar/UserList";

export default function DepartmentList() {
  const router = useRouter();
  const { user } = useUser();
  const API_URL = useApi().API_URL;
  const { showAlert } = useSwal();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([
    { id: "name_department", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      const { data } = await axios.get(`${API_URL}/portal-department`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(data ?? []);
    } catch (err) {
      console.error("Error fetching department:", err);
      setData([]);
    }
  }, [user.token, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    const result = await showAlert(
      "Delete Department",
      "question",
      "Are you sure you want to delete this department?",
      "Yes, Delete",
      true,
    );

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/portal-department/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        showAlert("Deleted!", "success", "Department has been deleted.", "OK");
        fetchData();
      } catch {
        showAlert("Error", "error", "Failed to delete department.", "OK");
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "no",
        header: "No",
        cell: ({ row }) => row.index + 1,
        size: 40,
      },
      {
        accessorFn: (row) => row.name_department,
        id: "name_department",
        header: "Department Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: "Created Date",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.created_date),
      },
      {
        id: "action",
        header: "Action",
        size: 150,
        cell: ({ row }) => {
          const dept = row.original;
          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Button
                size="xs"
                color="blue"
                leftSection={<IconEdit size={14} />}
                onClick={() =>
                  router.push(`/department/edit/${dept.id_department}`)
                }
              >
                Edit
              </Button>
              <Button
                size="xs"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(dept.id_department)}
              >
                Delete
              </Button>
            </Group>
          );
        },
      },
    ],
    [API_URL, user.token, router],
  );

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
  });

  return (
    <>
      <Head>
        <title>Department Management | ARMC</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-md font-extrabold text-teal-600 uppercase">
                  Department Management
                </h1>
                <p className="text-xs text-gray-500">Manage departments</p>
              </div>
              <Button
                size="sm"
                color="teal"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push(`/department/add`)}
              >
                Add Department
              </Button>
            </div>
            <Datatables table={table} totalPages={totalPages} />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
