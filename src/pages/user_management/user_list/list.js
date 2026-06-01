import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios from "axios";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Tooltip,
} from "@mantine/core";
import {
  IconEdit,
  IconPlus,
  IconKey,
  IconFileSpreadsheet,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Head from "next/head";
import userList from "@/data/sidebar/UserList";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";

export default function UserList() {
  const router = useRouter();
  const { user } = useUser();
  const API_URL = useApi().API_URL;
  const { encrypt } = useEncrypt();
  const { showLoading, closeSwal, showAlert, showConfirm } = useSwal();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([{ id: "full_name", desc: false }]);
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
        `${API_URL}/user/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching User:", err);
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

  const handleExportExcel = async () => {
    try {
      showLoading("Preparing File...");

      const searchQuery = {};
      columnFilters.forEach((filter) => {
        if (filter.value) searchQuery[filter.id] = filter.value;
      });

      const response = await axios.get(`${API_URL}/excel/export-users`, {
        params: {
          search: JSON.stringify(searchQuery),
        },
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", `User_List_Export.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      closeSwal();
    } catch (err) {
      console.error("Export error:", err);

      showAlert(
        "Export Failed",
        "error",
        err.response?.data?.message ||
          "There was an error generating the file.",
        "Close",
      );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Delete User",
      "Are you sure you want to delete this user? This action cannot be undone.",
      "Yes, Delete",
    );

    if (result.isConfirmed) {
      showLoading("Deleting user...");
      try {
        await axios.delete(`${API_URL}/user/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        closeSwal();
        showAlert("Deleted!", "success", "User has been deleted.", "OK");

        fetchData();
      } catch (error) {
        closeSwal();
        showAlert(
          "Error",
          "error",
          error.response?.data?.message || "Failed to delete user.",
          "OK",
        );
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
        accessorFn: (row) => row.username,
        id: "username",
        header: "Username",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.badge_no,
        id: "badge_no",
        header: "Badge ID",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "Full Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.project?.project_name,
        id: "project_name",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.department?.name_of_department,
        id: "department_name",
        header: "Department",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.position?.position_name,
        id: "position_name",
        header: "Position",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.role?.role_name,
        id: "role_name",
        header: "Role",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: "Email",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "action",
        header: "Action",
        size: 200,
        cell: ({ row }) => {
          const userRow = row.original;

          const encryptedId = encrypt(String(userRow.id_user));

          const handleResetPassword = async () => {
            const result = await showConfirm(
              "Reset Password?",
              `Are you sure you want to reset password for ${userRow.full_name}?`,
              "Yes, Reset!",
            );

            if (!result.isConfirmed) return;

            try {
              showLoading("Sending reset link to email...");

              const response = await axios.post(
                `${API_URL}/user/reset-password`,
                { id_user: userRow.id_user },
                { headers: { Authorization: `Bearer ${user.token}` } },
              );

              closeSwal();

              showAlert(
                "Success!",
                "success",
                `Password for ${userRow.full_name} has been reset. Reset link has been sent to their email.`,
                "OK",
              );
            } catch (err) {
              closeSwal();

              showAlert(
                "Failed!",
                "error",
                err.response?.data?.message || "Failed to reset password",
                "OK",
              );
            }
          };

          return (
            <Group gap={8} justify="center" wrap="nowrap">
              <Tooltip label="Edit User" withArrow position="bottom">
                <ActionIcon
                  variant="filled"
                  color="teal"
                  size="md"
                  radius="md"
                  onClick={() => {
                    router.push(
                      `/user_management/user_list/edit/${encryptedId}`,
                    );
                  }}
                >
                  <IconEdit size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Reset Password" withArrow position="bottom">
                <ActionIcon
                  variant="filled"
                  color="gray"
                  size="md"
                  radius="md"
                  onClick={handleResetPassword}
                >
                  <IconKey size={18} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Delete User" withArrow position="bottom">
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
      pagination.pageIndex,
      pagination.pageSize,
      showConfirm,
      API_URL,
      user.token,
      showAlert,
      router,
      encrypt,
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
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <>
      <Head>
        <title>User Management | ARMC</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-md font-extrabold text-teal-600 uppercase">
                  User Management
                </h1>
                <p className="text-xs text-gray-500">
                  Manage user accounts and roles
                </p>
              </div>
              <Group>
                <Button
                  size="sm"
                  color="teal"
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
                <Button
                  size="sm"
                  color="teal"
                  leftSection={<IconPlus size={16} />}
                  onClick={() =>
                    router.push(`/user_management/user_list/add_user`)
                  }
                >
                  Add New User
                </Button>
              </Group>
            </div>
            <Datatables table={table} totalPages={totalPages} />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
