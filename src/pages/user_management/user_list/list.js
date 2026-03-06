import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import axios from "axios";
import { Badge, Button, Group, Paper } from "@mantine/core";
// import { notifications } from "@mantine/notifications"
import {
  IconKey,
  IconPlus,
  IconUserCheck,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Head from "next/head";
import userListSidebar from "@/data/sidebar/UserList";
import { formatDate } from "@/lib/dateFormat";

export default function UserList() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API_URL = useApi().API_URL;

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([
    { id: "created_date", desc: true }, 
  ]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!user?.token || !router.isReady) return;

    // Default filter: Hanya User Aktif (status_user: 1)
    const searchQuery = {
      status_user: 1,
    };

    columnFilters.forEach((filter) => {
      if (filter.value) {
        searchQuery[filter.id] = filter.value;
      }
    });

    const filterParams = `search=${encodeURIComponent(JSON.stringify(searchQuery))}`;
    const sort = sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    try {
      const { data } = await axios.post(
        `${API_URL}/api/user/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      setData(data.data ?? []);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      setData([]);
      setTotalPages(1);
    }
  }, [user.token, router.isReady, columnFilters, sorting, API_URL, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => [
    {
      id: "no",
      header: "No",
      cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
      size: 40,
    },
    {
      accessorKey: "created_date",
      header: "Created Date",
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "badge_no",
      header: "Badge ID",
    },
    {
      accessorKey: "full_name",
      header: "Full Name",
    },
    {
      accessorKey: "company_name",
      header: "Company",
    },
    {
      accessorKey: "department_name",
      header: "Department",
    },
    {
      accessorKey: "project_name",
      header: "Project",
    },
    {
      accessorKey: "role_name",
      header: "Role",
    },
    {
      accessorKey: "status_user",
      header: "Account Status",
      cell: () => (
        <Badge color="blue" variant="light" leftSection={<IconUserCheck size={12} />}>
          Active
        </Badge>
      ),
    },
    {
      accessorKey: "outside_access",
      header: "Outside Access",
      cell: ({ getValue }) => {
        const value = getValue();
        return value === 1 ? (
          <Badge color="green" variant="filled">Enable</Badge>
        ) : (
          <Badge color="red" variant="filled">Disabled</Badge>
        );
      },
    },
    {
      id: "action",
      header: "Action",
      size: 150,
      cell: ({ row }) => {
        const userRow = row.original;
        const handleResetPassword = async () => {
          try {
            await axios.post(
              `${API_URL}/api/user/reset-password`,
              { id_user: userRow.id_user },
              { headers: { Authorization: `Bearer ${user.token}` } },
            );
            notifications.show({
              title: "Success",
              message: "Password has been successfully reset",
              color: "green",
            });
          } catch (error) {
            notifications.show({
              title: "Error",
              message: "Failed to reset password",
              color: "red",
            });
          }
        };

        return (
          <Group gap={6} justify="center">
            <Button
              size="xs"
              variant="outline"
              color="gray"
              leftSection={<IconKey size={14} />}
              onClick={handleResetPassword}
            >
              Reset
            </Button>
          </Group>
        );
      },
    },
  ], [pagination.pageIndex, pagination.pageSize, API_URL, user.token]);

  const table = useReactTable({
    data,
    columns,
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
        <title>Active Users | ARMC</title>
      </Head>

      <AuthLayout sidebarList={userListSidebar}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-md font-extrabold text-blue-600 uppercase">
                  Active Users List
                </h1>
                <p className="text-xs text-gray-500">
                  Manage all active user accounts and their permissions
                </p>
              </div>

              <Button
                size="sm"
                color="blue"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push(`/user_management/add_user`)}
              >
                Add New User
              </Button>
            </div>

            <Datatables table={table} totalPages={totalPages} />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}