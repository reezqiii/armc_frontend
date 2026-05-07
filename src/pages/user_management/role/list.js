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
import useSwal from "@/hooks/useSwal";
import userList from "@/data/sidebar/UserList";
import useEncrypt from "@/hooks/useEncrypt";

export default function RoleList() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API_URL = useApi().API_URL;
  const { showAlert } = useSwal();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([{ id: "role_name", desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!user?.token) return;

    const searchQuery = {};
    columnFilters.forEach((filter) => {
      if (
        filter.value !== undefined &&
        filter.value !== null &&
        filter.value !== ""
      ) {
        searchQuery[filter.id] = filter.value;
      }
    });

    const filterParams =
      Object.keys(searchQuery).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(searchQuery))}`
        : "";

    const sort =
      sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    try {
      const { data } = await axios.post(
        `${API_URL}/role/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching Role:", err);
    }
  }, [
    user.token,
    API_URL,
    columnFilters,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

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
        cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize,
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
                onClick={() => {
                  const encryptedId = encrypt(String(role.id_role));
                  router.push(`/user_management/role/edit/${encryptedId}`);
                }}
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
    state: { columnFilters, sorting, pagination },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
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
                onClick={() => router.push(`/user_management/role/add_role`)}
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
