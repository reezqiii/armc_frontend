import Datatables from "@/components/custom/Datatables";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { useRouter } from "next/router";
import useEncrypt from "@/hooks/useEncrypt";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Paper,
  Badge,
  Button,
  Group,
  Text,
  Checkbox,
  SimpleGrid,
} from "@mantine/core";
import {
  IconFileText,
  IconClock,
  IconUserExclamation,
  IconUserCog,
  IconCircleCheck,
  IconRefresh,
  IconX,
  IconFileSpreadsheet,
  IconInfoCircle,
  IconEdit,
  IconSend,
  IconCheck,
  IconListLetters,
  IconFileTypePdf,
} from "@tabler/icons-react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { hasPermission } from "@/lib/permissionHelper";
import AdminStatusCell from "@/data/status/AdminStatusCell";
import RejectTimelineModal from "@/components/request/RejectTimelineModal";
import { formatDate } from "@/lib/dateFormat";
import { getRequestActionPermission } from "@/lib/requestStatus";
import { getRequestStatus } from "@/lib/requestStatusList";
import Head from "next/head";
import Link from "next/link";

const STATUS_CONFIG = {
  all: {
    id: null,
    label: "All User Request",
    icon: IconListLetters,
    color: "blue",
    actions: ["detail", "admin_status"],
  },
  draft: {
    id: 0,
    label: "Draft",
    icon: IconFileText,
    color: "gray",
    actions: ["detail", "update", "cancel", "submit_bulk"],
  },
  "awaiting-hod-approval": {
    id: 1,
    label: "Awaiting HOD Approval",
    icon: IconClock,
    color: "yellow",
    actions: ["detail", "update", "cancel", "approve_bulk", "admin_status"],
  },
  "awaiting-lead-it-approval": {
    id: 3,
    label: "Awaiting Lead IT Approval",
    icon: IconUserExclamation,
    color: "yellow",
    actions: ["detail", "update", "cancel", "approve_bulk", "admin_status"],
  },
  "awaiting-it-manager-approval": {
    id: 5,
    label: "Awaiting IT Manager Approval",
    icon: IconUserCog,
    color: "yellow",
    actions: ["detail", "update", "cancel", "approve_bulk", "admin_status"],
  },
  completed: {
    id: 7,
    label: "Completed",
    icon: IconCircleCheck,
    color: "green",
    actions: ["detail", "admin_status"],
  },
  returned: {
    id: 8,
    label: "Returned",
    icon: IconRefresh,
    color: "orange",
    actions: ["detail", "update", "cancel"],
  },
  "rejected-hod-approval": {
    id: 2,
    label: "Rejected by HOD Approval",
    icon: IconX,
    color: "red",
    actions: ["detail", "view_reason"],
  },
  "rejected-lead-it-approval": {
    id: 4,
    label: "Rejected by Lead IT Approval",
    icon: IconX,
    color: "red",
    actions: ["detail", "view_reason"],
  },
  "rejected-it-manager-approval": {
    id: 6,
    label: "Rejected by IT Manager Approval",
    icon: IconX,
    color: "red",
    actions: ["detail", "view_reason"],
  },
};

export default function RequestListDynamic({ request_status }) {
  const router = useRouter();
  const config = STATUS_CONFIG[request_status];

  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRejectData, setSelectedRejectData] = useState(null);

  const canApprove = useMemo(() => {
    if (!config || !user?.id) return false;

    if (config.id === 1) {
      return data.some((item) => item.approval_hod_by?.id === user.id);
    }

    if (config.id === 3 && hasPermission(0)) return true;

    if (config.id === 5 && hasPermission(1)) return true;

    return false;
  }, [config, data, user.id]);

  const canExport = useMemo(() => {
    return hasPermission(3);
  }, []);

  const getData = useCallback(async () => {
    if (!config || !user?.token) return;

    const searchQuery = {
      ...(config.id !== null && { request_status: config.id }),

      ...(config.id === 0 && {
        status_active: 1,
        requestor_id: user.id,
        type: 0,
      }),
    };

    columnFilters.forEach((filter) => {
      if (filter.value !== null && filter.value !== "") {
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
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to cancel this request",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      });

      if (!result.isConfirmed) return;

      try {
        await axios.put(
          `${API_URL}/requests/cancel/${encrypt(String(id))}`,
          {},
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );

        // Hapus item dari data
        setData((prev) => prev.filter((item) => item.id_request !== id));

        Swal.fire("Success", "Request canceled", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to cancel", "error");
      }
    },
    [API_URL, encrypt, user.token],
  );

  const handleBulkProcess = async (action) => {
    const selectedRows = table.getSelectedRowModel().rows;
    const ids = selectedRows.map((r) => r.original.id_request);

    if (!Array.isArray(ids) || ids.length === 0) {
      Swal.fire("Error", "No request selected", "error");
      return;
    }

    // Tentukan judul Swal sesuai action
    let title = "";
    if (action === "approve") title = `Approve ${ids.length} request(s)?`;
    else if (action === "reject") title = `Reject ${ids.length} request(s)?`;
    else if (action === "submit")
      title = `Submit ${ids.length} request(s) to HOD?`;
    else title = `${action} ${ids.length} request(s)?`;

    const confirm = await Swal.fire({
      title,
      icon: "question",
      showCancelButton: true,
      confirmButtonText:
        action === "submit"
          ? "Yes, Submit"
          : action === "approve"
            ? "Yes, Approve"
            : action === "reject"
              ? "Yes, Reject"
              : "Yes",
      cancelButtonText: "No, cancel",
    });

    if (!confirm.isConfirmed) return;

    let remarks = "";
    if (action === "reject") {
      const { value } = await Swal.fire({
        title: "Rejection Reason",
        input: "textarea",
        inputValidator: (value) => !value && "Rejection reason is required",
        showCancelButton: true,
      });
      if (!value) return;
      remarks = value;
    }

    // Encrypt semua IDs
    let encryptedIds;
    try {
      encryptedIds = ids.map((id) => encrypt(String(id)));
    } catch (err) {
      Swal.fire("Error", "Failed to encrypt IDs", "error");
      return;
    }

    // Tentukan endpoint
    let endpoint = "";
    if (action === "submit") endpoint = "/requests/submit-to-hod/bulk";
    else if (action === "approve" || action === "reject")
      endpoint =
        config.id === 1
          ? "/requests/hod-approval/bulk"
          : config.id === 3
            ? "/requests/lead-it-approval/bulk"
            : "/requests/it-approval/bulk";

    try {
      await axios.put(
        `${API_URL}${endpoint}`,
        {
          encryptedIds,
          action,
          remarks,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      Swal.fire("Success", "Requests processed", "success");
      setRowSelection({});
      getData();
    } catch (err) {
      Swal.fire("Error", "Failed to process bulk action", "error");
      console.error(err);
    }
  };

  const handleExportExcel = async () => {
    if (!canExport) return;

    try {
      Swal.fire({
        title: "Preparing File...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const tableFilters = {};
      columnFilters.forEach((f) => {
        if (f.value !== null && f.value !== "") {
          tableFilters[f.id] = f.value;
        }
      });

      const filterPayload = {
        ...tableFilters,
        ...(config.id !== null && { request_status: config.id }),
        ...(config.id === 0
          ? { status_active: 1, requestor_id: user.id, type: 0 }
          : {}),
      };

      const response = await axios.get(`${API_URL}/excel/export-list`, {
        params: {
          search: JSON.stringify(filterPayload),
          status: request_status,
          sort_by: sorting[0]?.id,
          sort_order: sorting[0]?.desc ? "desc" : "asc",
        },
        headers: { Authorization: `Bearer ${user.token}` },
        responseType: "blob",
      });

      if (!response.data || response.data.size === 0) {
        throw new Error("Empty file received");
      }

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const now = new Date();

      const timestamp =
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");
      const fileName = `pcms-armc-${timestamp}.xlsx`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.close();
    } catch (err) {
      console.error("Export Error:", err);
      Swal.fire("Error", "Export failed atau server timeout", "error");
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
        console.error(err);
        Swal.fire("Error", "Failed to generate PDF", "error");
      }
    },
    [API_URL, encrypt, user.token],
  );

  const handleReturn = useCallback(
    (id) => {
      Swal.fire({
        title: "Return for Revision?",
        text: "This request will be returned to the requestor for revision.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Return",
      }).then(async (result) => {
        if (!result.isConfirmed) return;

        try {
          const encryptedId = encrypt(String(id));

          const res = await axios.post(
            `${API_URL}/requests/${encryptedId}/return`,
            {},
            { headers: { Authorization: `Bearer ${user.token}` } },
          );

          Swal.fire(
            "Success",
            "The request has been returned for revision.",
            "success",
          );

          getData();
        } catch (err) {
          console.error("Axios Error:", err);
          Swal.fire(
            "Error",
            err.response?.data?.message || "An error occurred.",
            "error",
          );
        }
      });
    },
    [API_URL, encrypt, user.token, getData],
  );

  const columns = useMemo(() => {
    const cols = [];
    if (config?.actions.some((a) => a.includes("bulk"))) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = table.getIsSomePageRowsSelected();
            }}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            ref={(el) => {
              if (el) el.indeterminate = row.getIsSomeSelected();
            }}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 40,
      });
    }

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
        accessorFn: (row) => {
          const TYPE_LABELS = {
            0: "Internal",
            1: "External",
          };
          return TYPE_LABELS[row.type] ?? "-";
        },
        id: "type",
        header: "Type",
        enableColumnFilter: true,
        enableSorting: true,
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.category_account,
        id: "category_account",
        header: "Category Account",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => {
          const CATEGORY_LABELS = {
            0: "Create New Account",
            1: "Request Permission",
            2: "Request Outside Access",
          };
          return CATEGORY_LABELS[row.original.category_account] || "-";
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
              by: row.original.approval_hod_by?.full_name,
              at: row.original.approval_hod_date_at,
              reason: row.original.rejected_hod_remarks,
            };
          }

          if (displayStatus === 4) {
            rejectField = {
              by: row.original.approval_lead_it_by?.full_name,
              at: row.original.approval_lead_date_at,
              reason: row.original.rejected_lead_remarks,
            };
          }

          if (displayStatus === 6) {
            rejectField = {
              by: row.original.approval_it_hod_by?.full_name,
              at: row.original.approval_it_date_at,
              reason: row.original.rejected_it_remarks,
            };
          }

          return (
            <div className="flex flex-col items-center justify-center gap-1 w-full">
              {/* STATUS BADGE */}
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

              {/* VIEW REASON */}
              {rejectField && (
                <Button
                  size="compact-xs"
                  variant="light"
                  color="red"
                  onClick={() => {
                    setSelectedRejectData({
                      status: status.label,
                      rejected_by_name: rejectField.by,
                      rejected_at: formatDate(row.original.created_date),
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

    if (config?.actions.includes("admin_status")) {
      cols.push({
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
      });
    }

    cols.push({
      id: "action",
      header: "Action",
      enableColumnFilter: false,
      enableSorting: true,
      size: 300,
      cell: ({ row }) => {
        const request = row.original;
        const encryptedId = encrypt(String(request.id_request));

        const status = request.request_status;
        const hasItPermission = hasPermission(2);

        const { canEditCancel, canReturn, showOnlyDetail } =
          getRequestActionPermission(status, hasItPermission);

        return (
          <SimpleGrid cols={2} spacing={6}>
            <Link
              href={`/user_request/detail_req/${encryptedId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                component="a"
                fullWidth
                size="xs"
                color="blue"
                leftSection={<IconInfoCircle size={14} />}
              >
                Details
              </Button>
            </Link>

            {/* UPDATE */}
            {canEditCancel && (
              <Link
                href={`/user_request/edit_req/${encryptedId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  component="a"
                  fullWidth
                  leftSection={<IconEdit size={16} />}
                  color="yellow"
                  size="xs"
                >
                  Update
                </Button>
              </Link>
            )}

            {/* CANCEL */}
            {canEditCancel && (
              <Button
                fullWidth
                leftSection={<IconX size={16} />}
                color="red"
                size="xs"
                onClick={() => handleCancel(request.id_request)}
              >
                Cancel
              </Button>
            )}

            <Link
              href={`${API_URL}/requests/${encryptedId}/generate-pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                component="a"
                fullWidth
                leftSection={<IconFileTypePdf size={16} />}
                color="gray"
                size="xs"
              >
                PDF
              </Button>
            </Link>

            {/* RETURN */}
            {canReturn && (
              <Button
                fullWidth
                leftSection={<IconRefresh size={16} />}
                color="orange"
                size="xs"
                onClick={() => handleReturn(request.id_request)}
              >
                Return
              </Button>
            )}
          </SimpleGrid>
        );
      },
    });

    return cols;
  }, [
    config?.actions,
    pagination.pageIndex,
    pagination.pageSize,
    API_URL,
    user.token,
    encrypt,
    handleCancel,
    handleReturn,
    setData,
  ]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      rowSelection,
      columnFilters,
      sorting,
      pagination,
    },
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
            {/* HEADER */}
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <config.icon size={22} />
                </div>
                <div>
                  <h1 className="text-md font-extrabold text-blue-600 uppercase">
                    {config.label} List
                  </h1>
                  <p className="text-xs text-gray-500">
                    ITF14 - {config.label}
                  </p>
                </div>
              </div>

              {canExport && (
                <Button
                  color="green"
                  size="sm"
                  leftSection={<IconFileSpreadsheet size={16} />}
                  onClick={handleExportExcel}
                >
                  Export Excel
                </Button>
              )}
            </div>

            {/* TABLE */}
            <Datatables table={table} totalPages={totalPages} />

            {/* MODAL */}
            <RejectTimelineModal
              opened={modalOpen}
              onClose={() => setModalOpen(false)}
              data={selectedRejectData}
            />

            {/* BULK ACTION */}
            {hasSelectedRows && (
              <div className="flex justify-between items-center border-t pt-4 mt-4 bg-slate-50 p-3 rounded">
                <Text size="sm" fw={600}>
                  Selected {Object.keys(rowSelection).length} items
                </Text>

                <Group>
                  {config.id === 0 && (
                    <Button
                      color="green"
                      size="xs"
                      leftSection={<IconSend size={16} />}
                      onClick={() => handleBulkProcess("submit")}
                    >
                      Submit to HOD Request
                    </Button>
                  )}

                  {config.actions.includes("approve_bulk") && canApprove && (
                    <>
                      <Button
                        size="xs"
                        color="green"
                        leftSection={<IconCheck size={14} />}
                        onClick={() => handleBulkProcess("approve")}
                      >
                        Approve
                      </Button>

                      <Button
                        size="xs"
                        color="red"
                        leftSection={<IconX size={14} />}
                        onClick={() => handleBulkProcess("reject")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </Group>
              </div>
            )}
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
