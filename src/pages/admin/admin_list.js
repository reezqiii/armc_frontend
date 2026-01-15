import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Paper, Badge, ButtonGroup, Group } from "@mantine/core";
import {
  IconInfoCircle,
  IconEdit,
  IconX,
  IconFileSpreadsheet,
  IconClipboardList,
} from "@tabler/icons-react";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { formatDate } from "@/lib/dateFormat";
import { hasPermission } from "@/lib/permissionHelper";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import useEncrypt from "@/hooks/useEncrypt";
import Head from "next/head";
import AdminStatusCell from "@/data/status/AdminStatusCell";

export default function AdminList() {
  const router = useRouter();
  const path = usePathname();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();
  const { status: queryStatus } = router.query;

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("onQueue");
  const [isCanceling, setIsCanceling] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [permissions, setPermissions] = useState({
    approvalLeadIt: [],
    approvalItManager: [],
    itAction: [],
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    if (queryStatus) {
      setStatus(String(queryStatus));
    }

    if (user?.permissions) {
      setPermissions(user.permissions);
    }
  }, [queryStatus, user]);

  const titleMap = {
    onQueue: "On Queue - ARMC",
    onProgress: "On Progress - ARMC",
    completed: "Completed - ARMC",
  };

  const pageTitle = titleMap[status] || "Admin List";

  const updatedSidebarList = requestorList.map((item) => {
    if (item.title === "Admin") {
      return {
        ...item,
        child: item.child.map((child) => ({
          ...child,
          active: child.href.endsWith(status),
        })),
      };
    }
    return item;
  });

  const handleCancel = useCallback(
    async (id_request) => {
      const result = await Swal.fire({
        title: "Are you sure you want to cancel this request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep it",
      });

      if (!result.isConfirmed) return;

      setIsDeleting(true);
      try {
        const encryptedId = encrypt(String(id_request));

        await axios.put(
          `${API_URL}/requests/cancel/${encryptedId}`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setData((prev) =>
          prev.filter((item) => item.id_request !== id_request)
        );

        Swal.fire({
          icon: "success",
          title: "Canceled!",
          text: "The request has been marked as canceled.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Failed to cancel the request.",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [API_URL, user.token, encrypt]
  );

  const handleExportExcel = async () => {
    try {
      const statusMap = { onQueue: 0, onProgress: 1, completed: 2 };

      const sort_by = sorting[0]?.id || "id_request";
      const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

      const filterObj = Object.fromEntries(
        columnFilters.map((f) => [f.id, f.value])
      );

      const search = JSON.stringify({
        request_admin: statusMap[status],
        ...filterObj,
      });

      const url = `${API_URL}/excel/export-list?search=${encodeURIComponent(
        search
      )}&sort_by=${sort_by}&sort_order=${sort_order}`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Export failed:", errorText);
        throw new Error("Gagal export excel");
      }

      const blob = await res.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "export_requests_list.xlsx";
      link.click();
    } catch (error) {
      console.error("Error:", error);
      alert("Export Excel gagal. Cek console.");
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
        accessorFn: (row) => row.id_request,
        id: "id_request",
        header: "No Request",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) =>
          `ITF14-${String(row.original.id_request).padStart(6, "0")}`,
      },
      {
        accessorFn: (row) => row.created_date,
        id: "created_date",
        header: "Request Date",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => formatDate(row.original.created_date),
      },
      {
        accessorFn: (row) => row.requestor_name,
        id: "requestor_name",
        header: "Requestor",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.badge_no,
        id: "badge_no",
        header: "Badge ID",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "Full Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.department_name,
        id: "department_name",
        header: "Department",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.position_name,
        id: "position_name",
        header: "Position",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.company_name,
        id: "company_name",
        header: "Company",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: "Email",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.type,
        id: "type",
        header: "Type",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => (row.original.type === 1 ? "Public" : "Login"),
      },
      {
        accessorFn: (row) => row.request_admin,
        id: "request_admin",
        header: "Admin Status",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <AdminStatusCell
            value={row.original.request_admin}
            id_request={row.original.id_request}
            API_URL={API_URL}
            token={user.token}
            setData={setData}
            permissions={permissions}
          />
        ),
      },
      {
        accessorFn: (row) => row.id_request,
        id: "action",
        header: "Action",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const encryptedId = encrypt(String(row.original.id_request));

          return (
            <Group justify="center">
              <ButtonGroup>
                <Button
                  leftSection={<IconInfoCircle size={16} />}
                  color="blue"
                  size="xs"
                  onClick={() =>
                    router.push(`/user_request/detail_req/${encryptedId}`)
                  }
                >
                  Details
                </Button>

                <Button
                  leftSection={<IconEdit size={16} />}
                  color="yellow"
                  size="xs"
                  onClick={() =>
                    router.push(`/user_request/edit_req/${encryptedId}`)
                  }
                >
                  Update
                </Button>

                <Button
                  leftSection={<IconX size={16} />}
                  color="red"
                  size="xs"
                  onClick={() => handleCancel(row.original.id_request)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </ButtonGroup>
            </Group>
          );
        },
      },
    ],
    [
      API_URL,
      encrypt,
      handleCancel,
      isDeleting,
      pagination.pageIndex,
      pagination.pageSize,
      permissions,
      router,
      user.token,
    ]
  );

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

  const fetchData = useCallback(async () => {
    const statusMap = { onQueue: 0, onProgress: 1, completed: 2 };

    const sort_by = sorting[0]?.id || "id_request";
    const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

    const filterObj = Object.fromEntries(
      columnFilters.map((f) => [f.id, f.value])
    );

    const search = JSON.stringify({
      request_admin: statusMap[status],
      ...filterObj,
    });

    try {
      const res = await axios.post(
        `${API_URL}/requests/serverside_list?search=${encodeURIComponent(
          search
        )}&sort_by=${sort_by}&sort_order=${sort_order}&page=${
          pagination.pageIndex
        }&size=${pagination.pageSize}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setData(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  }, [API_URL, status, sorting, columnFilters, pagination, user.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData, status]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <AuthLayout sidebarList={updatedSidebarList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <IconClipboardList size={22} />
                </div>

                <div>
                  <h1 className="text-md font-extrabold text-blue-600 uppercase">
                    {titleMap[status] || "Request List"}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Manage and review request data
                  </p>
                </div>
              </div>

              {/* Optional Action */}
              <Button
                color="green"
                size="sm"
                onClick={handleExportExcel}
                leftSection={<IconFileSpreadsheet size={16} />}
              >
                Export Excel
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
