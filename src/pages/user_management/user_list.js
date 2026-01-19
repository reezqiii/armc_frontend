import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import axios from "axios";
import { Button, Paper, Group, Badge } from "@mantine/core";
import { IconEdit, IconX, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import Head from "next/head";

export default function UserList() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [sorting, setSorting] = useState([{ id: "id", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchData = useCallback(async () => {
    // NOTE: assumption: the backend exposes a serverside listing endpoint for users
    const sort =
      sorting.length > 0
        ? `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`
        : "";

    const filterObj = Object.fromEntries(
      columnFilters.map((f) => [f.id, f.value]),
    );
    const filterParams =
      Object.keys(filterObj).length > 0
        ? `search=${encodeURIComponent(JSON.stringify(filterObj))}`
        : "";

    try {
      const res = await axios.post(
        `${API_URL}/users/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      // Expecting { data: [...], total_pages }
      setData(res.data.data ?? res.data ?? []);
      setTotalPages(res.data.total_pages ?? 1);
    } catch (err) {
      console.error("Error fetching users:", err);
      setData([]);
      setTotalPages(1);
    }
  }, [
    API_URL,
    user.token,
    columnFilters,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  useEffect(() => {
    if (!user?.token) return;
    fetchData();
  }, [fetchData, user?.token]);

  const handleToggleActive = useCallback(
    async (id) => {
      try {
        const encryptedId = encrypt(String(id));
        await axios.put(
          `${API_URL}/users/toggle-active/${encryptedId}`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        // optimistic update: refetch
        fetchData();
      } catch (err) {
        console.error("Failed to toggle active:", err);
      }
    },
    [API_URL, encrypt, user.token, fetchData],
  );

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
        cell: (info) => {
          const value = info.getValue();
          if (!value) return "-";
          return new Date(value).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
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
        accessorFn: (row) => row.password,
        id: "password",
        header: "Password",
        enableColumnFilter: false,
        enableSorting: true,
        cell: () => "********",
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
        id: "project",
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
        accessorFn: (row) => row.active,
        id: "active",
        header: "Account Status",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => (
          <Badge color={row.original.active ? "green" : "gray"} radius="sm">
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        accessorFn: (row) => row.outside_access,
        id: "outside_access",
        header: "Outside Access",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) =>
          row.original.outside_access ? "Enabled" : "Disabled",
      },
      {
        id: "action",
        header: "Action",
        enableColumnFilter: true,
        enableSorting: true,
        size: 240,
        cell: ({ row }) => {
          const userRow = row.original;
          const encryptedId = encrypt(String(userRow.id));
          return (
            <Group position="center">
              <Button
                size="xs"
                color="blue"
                leftIcon={<IconInfoCircle size={14} />}
                onClick={() =>
                  router.push(`/user_management/user_detail/${encryptedId}`)
                }
              >
                Details
              </Button>

              <Button
                size="xs"
                color="yellow"
                leftIcon={<IconEdit size={14} />}
                onClick={() =>
                  router.push(`/user_management/user_form/${encryptedId}`)
                }
              >
                Edit
              </Button>

              <Button
                size="xs"
                color={userRow.active ? "red" : "green"}
                leftIcon={<IconX size={14} />}
                onClick={() => handleToggleActive(userRow.id)}
              >
                {userRow.active ? "Deactivate" : "Activate"}
              </Button>
            </Group>
          );
        },
      },
    ];
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    encrypt,
    router,
    handleToggleActive,
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
        <title>User Management | ARMC</title>
      </Head>

      <AuthLayout>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <IconInfoCircle size={22} />
                </div>
                <div>
                  <h1 className="text-md font-extrabold text-blue-600 uppercase">
                    User Management
                  </h1>
                  <p className="text-xs text-gray-500">
                    Manage user accounts and roles
                  </p>
                </div>
              </div>

              <div>
                <Button
                  size="sm"
                  color="green"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => router.push(`/user_management/add_user`)}
                >
                  Add New User
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Datatables
                table={table}
                totalPages={totalPages}
                info={{ totalElements: data?.length ?? 0 }}
              />
            </div>
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
