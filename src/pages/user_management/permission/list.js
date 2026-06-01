import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { Paper, Button, Group, Text, ActionIcon, Tooltip } from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import userList from "@/data/sidebar/UserList";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";

export default function PermissionList() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API_URL = useApi().API_URL;
  const { showAlert } = useSwal();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([
    { id: "permission_name", desc: false },
  ]);
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
      const response = await axios.post(
        `${API_URL}/portal-permission/serverside_list?${params.toString()}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setData(response.data.data || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      console.error("Error fetching permission:", err);
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

  const handleDelete = async (id) => {
    const result = await showAlert(
      "Delete Permission",
      "question",
      "Are you sure?",
      "Yes, Delete",
      true,
    );
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/portal-permission/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        showAlert("Deleted!", "success", "Permission has been deleted.", "OK");
        fetchData();
      } catch {
        showAlert("Error", "error", "Failed to delete permission.", "OK");
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
        accessorFn: (row) => row.permission_name,
        id: "permission_name",
        header: "Permission Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.permission_group,
        id: "permission_group",
        header: "Group",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "action",
        header: "Action",
        size: 120,
        cell: ({ row }) => {
          const permission = row.original;
          const encryptedId = encrypt(String(permission.id_permission));

          return (
            <Group gap={8} justify="center" wrap="nowrap">
              <Tooltip label="Edit Permission" withArrow position="bottom">
                <ActionIcon
                  variant="filled"
                  color="teal"
                  size="md"
                  radius="md"
                  onClick={() => {
                    router.push(
                      `/user_management/permission/edit/${encryptedId}`,
                    );
                  }}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Delete Permission" withArrow position="bottom">
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
    filterFns: {},
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
        <title>Permission Management | ARMC</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-md font-extrabold text-teal-600 uppercase">
                  Permission Management
                </h1>
                <p className="text-xs text-gray-500">Manage permissions</p>
              </div>
              <Button
                size="sm"
                color="teal"
                leftSection={<IconPlus size={16} />}
                onClick={() =>
                  router.push(`/user_management/permission/add_permission`)
                }
              >
                Add Permission
              </Button>
            </div>
            <Datatables table={table} totalPages={totalPages} />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
