import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios from "axios";
import { ActionIcon, Button, Group, Paper, Text, Tooltip } from "@mantine/core";
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

    const params = new URLSearchParams({
      page: pagination.pageIndex,
      size: pagination.pageSize,
    });

    if (sorting.length > 0) {
      params.append(
        "sort",
        `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`,
      );
    }

    if (columnFilters.length > 0) {
      const searchObj = {};
      columnFilters.forEach((filter) => {
        if (
          filter.value !== undefined &&
          filter.value !== null &&
          filter.value !== ""
        ) {
          searchObj[filter.id] = filter.value;
        }
      });

      if (Object.keys(searchObj).length > 0) {
        params.append("search", JSON.stringify(searchObj));
      }
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/role/serverside_list?${params.toString()}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setData(data.data || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Error fetching Role:", err);
    }
  }, [
    user?.token,
    API_URL,
    columnFilters,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (encryptedId) => {
    const result = await showAlert(
      "Delete Role",
      "question",
      "Are you sure?",
      "Yes, Delete",
      true,
    );
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/role/${encryptedId}`, {
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
        size: 120,
        cell: ({ row }) => {
          const role = row.original;
          const encryptedId = encrypt(String(role.id_role));

          return (
            <Group gap={8} justify="center" wrap="nowrap">
              <Tooltip label="Edit Role" withArrow position="bottom">
                <ActionIcon
                  variant="filled"
                  color="teal"
                  size="md"
                  radius="md"
                  onClick={() => {
                    router.push(`/user_management/role/edit/${encryptedId}`);
                  }}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Delete Role" withArrow position="bottom">
                <ActionIcon
                  variant="filled"
                  color="red"
                  size="md"
                  radius="md"
                  onClick={() => handleDelete(encryptedId)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          );
        },
      },
    ],
    [
      API_URL,
      user?.token,
      router,
      encrypt,
      pagination.pageIndex,
      pagination.pageSize,
    ],
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
    pageCount: totalPages,
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
