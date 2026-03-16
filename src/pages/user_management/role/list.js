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

export default function RoleList() {
  const router = useRouter();
  const { user } = useUser();
  const API_URL = useApi().API_URL;
  const { showAlert } = useSwal();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1); 
  const [sorting, setSorting] = useState([{ id: "role_name", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    try {
      const { data } = await axios.get(`${API_URL}/role`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(data ?? []);
    } catch (err) {
      console.error("Error fetching role:", err);
      setData([]);
    }
  }, [user.token, API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    const result = await showAlert(
      "Delete Role",
      "question",
      "Are you sure?",
      "Yes, Delete",
      true,
    );
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/role/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        showAlert("Deleted!", "success", "Role has been deleted.", "OK");
        fetchData();
      } catch {
        showAlert("Error", "error", "Failed to delete role.", "OK");
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
        accessorFn: (row) => row.role_name,
        id: "role_name",
        header: "Role Name",
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
          const role = row.original;
          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Button
                size="xs"
                color="blue"
                leftSection={<IconEdit size={14} />}
                onClick={() =>
                  router.push(`/user_management/role/edit/${role.id_role}`)
                }
              >
                Edit
              </Button>
              <Button
                size="xs"
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(role.id_role)}
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
        <title>Role Management | ARMC</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-md font-extrabold text-teal-600 uppercase">
                  Role Management
                </h1>
                <p className="text-xs text-gray-500">Manage roles</p>
              </div>
              <Button
                size="sm"
                color="teal"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push(`/user_management/role/add`)}
              >
                Add Role
              </Button>
            </div>
            <Datatables table={table} totalPages={totalPages} />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
