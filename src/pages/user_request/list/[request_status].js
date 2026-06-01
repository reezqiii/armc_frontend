import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { useRouter } from "next/router";
import useEncrypt from "@/hooks/useEncrypt";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Tooltip,
  Paper,
  Badge,
  Button,
  Group,
  Text,
  SimpleGrid,
  ActionIcon,
} from "@mantine/core";
import {
  IconFileText,
  IconClock,
  IconUserCog,
  IconCircleCheck,
  IconX,
  IconFileSpreadsheet,
  IconInfoCircle,
  IconEdit,
  IconListLetters,
} from "@tabler/icons-react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import usePermission from "@/hooks/usePermission";
import RejectTimelineModal from "@/components/request/RejectTimelineModal";
import { getRequestStatus } from "@/lib/requestStatusList";
import Head from "next/head";
import useSwal from "@/hooks/useSwal";

const STATUS_CONFIG = {
  all: {
    id: null,
    label: "All User Request",
    icon: IconListLetters,
    color: "blue",
    actions: ["detail"],
  },
  canceled: {
    id: 0,
    label: "Canceled",
    icon: IconFileText,
    color: "gray",
    actions: ["detail"],
  },
  "awaiting-hod-approval": {
    id: 1,
    label: "Pending Dept Head Approval",
    icon: IconClock,
    color: "yellow",
    actions: ["detail", "update", "cancel"],
  },
  "rejected-hod-approval": {
    id: 2,
    label: "Rejected by Dept Head Approval",
    icon: IconX,
    color: "red",
    actions: ["detail", "view_reason"],
  },
  "awaiting-it-manager-approval": {
    id: 3,
    label: "Pending IT Head Approval",
    icon: IconUserCog,
    color: "yellow",
    actions: ["detail"],
  },
  "rejected-it-manager-approval": {
    id: 4,
    label: "Rejected by IT Head Approval",
    icon: IconX,
    color: "red",
    actions: ["detail", "view_reason"],
  },
  completed: {
    id: 5,
    label: "Completed",
    icon: IconCircleCheck,
    color: "green",
    actions: ["detail"],
  },
};

export default function RequestListDynamic({ request_status }) {
  const router = useRouter();
  const config = STATUS_CONFIG[request_status];

  const { user } = useUser();
  const { can } = usePermission();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();
  const { showAlert, showConfirm, showInput, showLoading, closeSwal } =
    useSwal();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRejectData, setSelectedRejectData] = useState(null);

  const isHOD = can("request.approve_hod");
  const isIT = can("request.approve_it");
  const canViewAll = can("request.view_all");
  const canExport = can("request.export");
  const isApprover = isHOD || isIT;
  const canApprove = useMemo(() => {
    if (!config || !user?.id) return false;

    if (config.id === 1 && isHOD) {
      return data.some((item) => item.approval_hod_by?.id === user.id);
    }

    if (config.id === 3 && isIT) return true;

    return false;
  }, [config, data, user.id, isHOD, isIT]);

  const getData = useCallback(async () => {
    if (!config || !user?.token) return;

    const searchQuery = {
      ...(config.id !== null &&
        config.id !== 0 && { request_status: config.id }),
      ...(config.id === 0 && { status_active: 0 }),
      ...(config.id !== 0 && { status_active: 1 }),
    };

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
        `${API_URL}/requests/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      setData(data.data);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [
    config,
    user.token,
    user.id,
    columnFilters,
    sorting,
    API_URL,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const handleCancel = useCallback(
    async (id) => {
      const result = await showConfirm(
        "Are you sure?",
        "You want to cancel this request",
        "Yes, cancel it!",
      );

      if (!result.isConfirmed) return;

      try {
        await axios.put(
          `${API_URL}/requests/cancel/${encrypt(String(id))}`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        setData((prev) => prev.filter((item) => item.id_request !== id));
        showAlert("Success", "success", "Request canceled", "OK");
      } catch (err) {
        showAlert("Error", "error", "Failed to cancel", "OK");
      }
    },
    [API_URL, encrypt, user.token, showConfirm, showAlert],
  );

  const handleExportExcel = async () => {
    if (!canExport) {
      showAlert(
        "Access Denied",
        "error",
        "You are not authorized to export this data",
        "OK",
      );
      return;
    }
    try {
      showLoading("Preparing File...");

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
        params: { search: JSON.stringify(activeFilters), sort_by, sort_order },
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
      closeSwal();
    } catch (err) {
      console.error("Export error:", err.response?.data || err.message);
      closeSwal();
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Export failed",
        "OK",
      );
    }
  };

  const columns = useMemo(() => {
    const cols = [];

    cols.push(
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
        header: "Request Info",
        enableColumnFilter: true,
        enableSorting: true,
        size: 150,
        cell: ({ row }) => {
          const requestNumber = `REQ-${String(row.original.id_request).padStart(6, "0")}`;
          return (
            <div className="flex flex-col items-center text-center w-full">
              {requestNumber}
            </div>
          );
        },
      },
      {
        accessorFn: (row) => row.created_by_name,
        id: "created_by_name",
        header: "Requestor",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.badge_no,
        id: "badge_no",
        header: "Badge No",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.full_name,
        id: "full_name",
        header: "Full Name",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.department_name,
        id: "department_name",
        header: "Department",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.project_name,
        id: "project_name",
        header: "Project",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.email,
        id: "email",
        header: "Email",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      },
      {
        accessorFn: (row) => row.category_account,
        id: "category_account",
        header: "Category Account",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => {
          const val = row.original.category_account;
          if (val === 0 || val === "0") return "Create New Account";
          if (val === 1 || val === "1") return "Request Permission";
          return "-";
        },
      },
      {
        accessorFn: (row) => row.request_status,
        id: "request_status",
        header: "Status Approval",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const rawStatus = row.original.request_status;
          const displayStatus =
            rawStatus === 8 && row.original.previous_status !== null
              ? row.original.previous_status
              : rawStatus;

          const status = getRequestStatus(displayStatus);

          let rejectField = null;
          if (displayStatus === 2) {
            rejectField = {
              reason: row.original.rejected_hod_remarks,
            };
          }
          if (displayStatus === 4) {
            rejectField = {
              reason: row.original.rejected_it_remarks,
            };
          }

          return (
            <div className="flex flex-col items-center justify-center gap-1 w-full">
              <Badge
                radius="sm"
                px="sm"
                styles={{
                  root: {
                    backgroundColor: status.bg,
                    color: status.text,
                    fontWeight: 600,
                    textAlign: "center",
                    textTransform: "none",
                  },
                }}
              >
                {status.label}
              </Badge>
              {rejectField && (
                <Button
                  size="compact-xs"
                  variant="light"
                  color="red"
                  onClick={() => {
                    setSelectedRejectData({
                      status: status.label,
                      rejected_reason: rejectField.reason,
                    });
                    setModalOpen(true);
                  }}
                >
                  View Reason
                </Button>
              )}
            </div>
          );
        },
      },
    );

    cols.push({
      id: "action",
      header: "Action",
      size: 150,
      enableColumnFilter: false,
      enableSorting: false,
      cell: ({ row }) => {
        const request = row.original;
        const encryptedId = encrypt(String(request.id_request));

        const isCreator = Number(request.created_by) === Number(user?.id);
        const isPendingHOD = request.request_status === 1;

        const isAdminIT = can(12);

        const canEdit = can(9) && (isAdminIT || (isCreator && isPendingHOD));
        const canCancel = can(10) && (isAdminIT || (isCreator && isPendingHOD));

        return (
          <Group gap={6} justify="center" wrap="nowrap">
            <Tooltip label="Details" withArrow>
              <ActionIcon
                size="md"
                radius="md"
                variant="filled"
                color="blue"
                onClick={() =>
                  router.push(`/user_request/detail_req/${encryptedId}`)
                }
              >
                <IconInfoCircle size={16} />
              </ActionIcon>
            </Tooltip>

            {canEdit && (
              <Tooltip label="Edit Request" withArrow>
                <ActionIcon
                  size="md"
                  radius="md"
                  variant="filled"
                  color="yellow"
                  onClick={() =>
                    router.push(`/user_request/edit_req/${encryptedId}`)
                  }
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {canCancel && (
              <Tooltip label="Cancel Request" withArrow>
                <ActionIcon
                  size="md"
                  radius="md"
                  variant="filled"
                  color="red"
                  onClick={() => handleCancel(request.id_request)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        );
      },
    });

    return cols;
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    user?.id,
    encrypt,
    router,
    handleCancel,
    can,
  ]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: { rowSelection, columnFilters, sorting, pagination },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  useEffect(() => {
    table.resetColumnFilters();
    table.setPageIndex(0);
    setRowSelection({});
  }, [request_status]);

  useEffect(() => {
    getData();
  }, [getData, request_status]);

  if (!config) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="p-10 text-center text-red-500 font-semibold">
          Status Not Found
        </div>
      </AuthLayout>
    );
  }

  const hasSelectedRows = Object.keys(rowSelection).length > 0;

  return (
    <>
      <Head>
        <title>{config.label} | ARMC</title>
      </Head>

      <AuthLayout sidebarList={requestorList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                  <config.icon size={22} />
                </div>
                <div>
                  <h1 className="text-md font-extrabold text-teal-600 uppercase">
                    {config.label} List
                  </h1>
                  <p className="text-xs text-gray-500">{config.label}</p>
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

            <RejectTimelineModal
              opened={modalOpen}
              onClose={() => setModalOpen(false)}
              data={selectedRejectData}
            />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}

export async function getStaticPaths() {
  const paths = Object.keys(STATUS_CONFIG).map((slug) => ({
    params: { request_status: slug },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  return { props: { request_status: params.request_status } };
}
