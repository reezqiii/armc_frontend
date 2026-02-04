import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import axios from "axios";
import { Badge, Button, Group, Paper, SimpleGrid } from "@mantine/core";
import {
  IconEdit,
  IconInfoCircle,
  IconKey,
  IconPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Head from "next/head";
import userList from "@/data/sidebar/UserList";
import { formatDate } from "@/lib/dateFormat";

export default function UserList() {
  const router = useRouter();
  const { user } = useUser();
  const { encrypt } = useEncrypt();
  const API_URL = useApi().API_URL;
  const statusMap = {
    active: 1,
    inactive: 0,
    locked: 2,
  };
  const statusParam = router.query.status_user;
  const statusUser =
    statusMap[statusParam] !== undefined ? statusMap[statusParam] : null;
  const titleMap = {
    active: "Active Users",
    inactive: "Inactive Users",
    locked: "Locked Users",
  };
  const statusNameMap = useMemo(
    () => ({
      0: "Inactive",
      1: "Active",
      2: "Locked",
    }),
    [],
  );
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!user?.token || statusUser === null || statusUser === undefined) return;
    if (!router.isReady) return null;
    const searchQuery = {
      status_user: statusUser,
    };

    columnFilters.forEach((filter) => {
      if (filter.value) {
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
  }, [
    user.token,
    statusUser,
    router.isReady,
    columnFilters,
    sorting,
    API_URL,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(() => {
    return [
      {
        id: "no",
        header: "No",
        cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize,
        size: 40,
      },
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: "Created Date",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.created_date),
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
        accessorFn: (row) => row.company_name,
        id: "company_name",
        header: "Company",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.department_name,
        id: "department_name",
        header: "Department",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.role_name,
        id: "role_name",
        header: "Role",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.status_user,
        id: "status_user",
        header: "Account Status",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => statusNameMap[info.getValue()] ?? "-",
      },
      {
        accessorFn: (row) => row.outside_access,
        id: "outside_access",
        header: "Outside Access",
        enableColumnFilter: false,
        enableSorting: false,
        cell: (info) => {
          const value = info.getValue();

          if (value === 1)
            return (
              <Badge color="green" variant="filled" size="md">
                Enable
              </Badge>
            );

          if (value === 0)
            return (
              <Badge color="red" variant="filled" size="md">
                Disabled
              </Badge>
            );

          return "-";
        },
      },

      {
        id: "action",
        header: "Action",
        size: 220,
        cell: ({ row }) => {
          const userRow = row.original;
          const encryptedId = encrypt(String(userRow.id_user));

          const handleResetPassword = async () => {
            try {
              await axios.post(
                `${API_URL}/api/user/reset-password`,
                { id_user: userRow.id_user },
                {
                  headers: { Authorization: `Bearer ${user.token}` },
                },
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
            <Group gap={6} justify="center" wrap="nowrap">
              <Button
                size="xs"
                color="yellow"
                leftSection={<IconEdit size={14} />}
                onClick={() =>
                  router.push(`/user_management/edit/${encryptedId}`)
                }
              >
                Update
              </Button>

              <Button
                size="xs"
                color="gray"
                leftSection={<IconKey size={14} />}
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </Group>
          );
        },
      },
    ];
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    statusNameMap,
    encrypt,
    API_URL,
    user.token,
    router,
  ]);

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

  return (
    <>
      <Head>
        <title>{titleMap[statusParam] ?? "User Management"} | ARMC</title>
      </Head>

      <AuthLayout sidebarList={userList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-md font-extrabold text-blue-600 uppercase">
                  {titleMap[statusParam] ?? "User Management"}
                </h1>
                <p className="text-xs text-gray-500">
                  Manage user accounts and roles
                </p>
              </div>

              <Button
                size="sm"
                color="green"
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
