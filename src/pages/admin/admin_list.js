import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Paper, Badge, Group, SimpleGrid } from "@mantine/core";

import {
  IconInfoCircle,
  IconEdit,
  IconX,
  IconFileSpreadsheet,
  IconClipboardList,
  IconFileTypePdf,
  IconRefresh,
} from "@tabler/icons-react";

import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/router";
import { formatDate } from "@/lib/dateFormat";
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
import { getRequestStatus } from "@/lib/requestStatusList";
import { hasPermission } from "@/lib/permissionHelper";

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

  const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const canExport = hasPermission(3);

  const fetchData = useCallback(async () => {
    const statusMap = { onQueue: 0, onProgress: 1, completed: 2 };

    let searchObj = {
      request_admin: statusMap[status],
    };

    columnFilters.forEach((filter) => {
      searchObj[filter.id] = filter.value;
    });

    const search = JSON.stringify(searchObj);

    try {
      const res = await axios.post(
        `${API_URL}/requests/serverside_list?search=${encodeURIComponent(
          search,
        )}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      setData(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error(err);
    }
  }, [API_URL, status, pagination, columnFilters, user.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (queryStatus) {
      setStatus(String(queryStatus));
    }
  }, [queryStatus]);

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
        confirmButtonText: "Yes, cancel it!",
      });

      if (!result.isConfirmed) return;

      try {
        const encryptedId = encrypt(String(id_request));

        await axios.put(
          `${API_URL}/requests/cancel/${encryptedId}`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        setData((prev) =>
          prev.filter((item) => item.id_request !== id_request),
        );

        Swal.fire("Success", "Request canceled", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to cancel", "error");
      }
    },
    [API_URL, user.token, encrypt],
  );

  const handleReturn = useCallback(
    async (id) => {
      const confirm = await Swal.fire({
        title: "Return this request?",
        icon: "warning",
        showCancelButton: true,
      });

      if (!confirm.isConfirmed) return;

      try {
        const encryptedId = encrypt(String(id));

        await axios.post(
          `${API_URL}/requests/${encryptedId}/return`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        Swal.fire("Success", "Returned for revision", "success");
        fetchData();
      } catch (err) {
        Swal.fire("Error", "Failed to return request", "error");
      }
    },
    [encrypt, API_URL, user.token, fetchData],
  );

  const handleExportExcel = async () => {
    if (!canExport) {
      Swal.fire(
        "Access Denied",
        "You are not authorized to export this data",
        "error",
      );
      return;
    }

    try {
      Swal.fire({
        title: "Preparing File...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const activeFilters = {
        ...(config.id !== null && { request_status: config.id }),
      };

      columnFilters.forEach((filter) => {
        if (
          filter.value !== undefined &&
          filter.value !== null &&
          filter.value !== ""
        ) {
          activeFilters[filter.id] = filter.value;
        }
      });

      const sort_by = sorting.length > 0 ? sorting[0].id : null;
      const sort_order =
        sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : null;

      const response = await axios.get(`${API_URL}/excel/export-list`, {
        params: {
          search: JSON.stringify(activeFilters),
          sort_by,
          sort_order,
        },
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${config.label.replace(/\s+/g, "_")}_Requests.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      Swal.close();
    } catch (err) {
      console.error("Export error:", err.response?.data || err.message);
      Swal.fire(
        "Error",
        err.response?.data?.message || "Export failed",
        "error",
      );
    }
  };

  const handleDownloadPdf = useCallback(
    async (id) => {
      try {
        Swal.fire({
          title: "Generating PDF...",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        const encryptedId = encrypt(String(id));

        const response = await axios.get(
          `${API_URL}/requests/${encryptedId}/generate-pdf`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            responseType: "blob",
          },
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute(
          "download",
          `Request_ITF14_${String(id).padStart(6, "0")}.pdf`,
        );

        document.body.appendChild(link);
        link.click();

        Swal.close();
      } catch (err) {
        Swal.fire("Error", "Failed generate PDF", "error");
      }
    },
    [API_URL, user.token, encrypt],
  );

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
        accessorFn: (row) => row.type_name,
        id: "type",
        header: "Type",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },

      {
        accessorFn: (row) => row.category_account_name,
        id: "category_account_name",
        header: "Category Account",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },

      {
        accessorFn: (row) => row.request_status,
        id: "request_status",
        header: "Status Approval",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const status = getRequestStatus(row.original.request_status);

          return (
            <div className="flex justify-center">
              <Badge
                styles={{
                  root: {
                    backgroundColor: status.bg,
                    color: status.text,
                    fontWeight: 600,
                  },
                }}
              >
                {status.label}
              </Badge>
            </div>
          );
        },
      },

      {
        accessorFn: (row) => row.request_admin,
        id: "request_admin",
        header: "IT Action",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => (
          <AdminStatusCell
            value={row.original.request_admin}
            id_request={row.original.id_request}
            API_URL={API_URL}
            token={user.token}
            setData={setData}
          />
        ),
      },

      {
        id: "action",
        header: "Action",
        enableColumnFilter: false,
        enableSorting: true,
        size: 300,
        cell: ({ row }) => {
          const request = row.original;
          const encryptedId = encrypt(String(request.id_request));

          return (
            <SimpleGrid cols={2} spacing={6}>
              <Button
                fullWidth
                size="xs"
                color="blue"
                leftSection={<IconInfoCircle size={14} />}
                onClick={() =>
                  router.push(`/user_request/detail_req/${encryptedId}`)
                }
              >
                Details
              </Button>

              <Button
                fullWidth
                size="xs"
                color="yellow"
                leftSection={<IconEdit size={14} />}
                onClick={() =>
                  router.push(`/user_request/edit_req/${encryptedId}`)
                }
              >
                Update
              </Button>

              <Button
                fullWidth
                size="xs"
                color="red"
                leftSection={<IconX size={14} />}
                onClick={() => handleCancel(request.id_request)}
              >
                Cancel
              </Button>

              <Button
                fullWidth
                size="xs"
                color="gray"
                leftSection={<IconFileTypePdf size={14} />}
                onClick={() => handleDownloadPdf(request.id_request)}
              >
                PDF
              </Button>

              <Button
                fullWidth
                size="xs"
                color="orange"
                leftSection={<IconRefresh size={14} />}
                onClick={() => handleReturn(request.id_request)}
              >
                Return
              </Button>
            </SimpleGrid>
          );
        },
      },
    ],
    [
      pagination.pageIndex,
      pagination.pageSize,
      API_URL,
      user.token,
      encrypt,
      router,
      handleCancel,
      handleDownloadPdf,
      handleReturn,
    ],
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, pagination, rowSelection },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <AuthLayout sidebarList={updatedSidebarList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <IconClipboardList size={22} />
                </div>

                <div>
                  <h1 className="text-md font-extrabold text-blue-600 uppercase">
                    {pageTitle}
                  </h1>
                </div>
              </div>

              {canExport && (
                <Button
                  color="green"
                  size="xs"
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
              )}
            </div>

            <Datatables table={table} totalPages={totalPages} />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
