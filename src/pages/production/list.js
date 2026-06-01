import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  Text,
  Badge,
  Tooltip,
  Group,
  ActionIcon,
} from "@mantine/core";
import {
  IconBuildingFactory,
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useEncrypt from "@/hooks/useEncrypt";
import Head from "next/head";
import productionList from "@/data/sidebar/ProductionList";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import Datatables from "@/components/custom/Datatables";
import useSwal from "@/hooks/useSwal";
import usePermission from "@/hooks/usePermission";

export default function ProductionList() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { encrypt } = useEncrypt();

  const { showAlert, showConfirm, showInput, showLoading, closeSwal } =
    useSwal();

  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const { can } = usePermission();

  const isAuthorized = can(15);
  const canApprove = can(33);
  const canUpdate = can(31);
  const canDelete = can(32);
  const canViewAll = can(29);

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
      const response = await axios.post(
        `${API_URL}/production/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      const responseData = response.data;

      setData(responseData.data);
      setTotalPages(responseData.total_pages);
      setTotalRecords(responseData.total_records || responseData.total);
    } catch (err) {
      console.error("Error fetching production:", err);
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
    if (isAuthorized && user?.token) {
      fetchData();
    }
  }, [fetchData, isAuthorized, user?.token]);

  const getStatusString = (statusInt) => {
    if (statusInt === 2) return "Approved by HOD";
    if (statusInt === 3) return "Rejected by HOD";
    return "Pending by HOD  ";
  };

  const getStatusBadge = (statusInt) => {
    const statusText = getStatusString(statusInt);
    switch (statusText) {
      case "Approved by HOD":
        return (
          <Badge color="teal" variant="filled" radius="sm">
            {statusText}
          </Badge>
        );
      case "Rejected by HOD":
        return (
          <Badge color="red" variant="filled" radius="sm">
            {statusText}
          </Badge>
        );
      default:
        return (
          <Badge color="orange" variant="filled" radius="sm">
            {statusText}
          </Badge>
        );
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Delete Record",
      "You will not be able to recover this record!",
      "Yes, delete it!",
    );

    if (result.isConfirmed) {
      showLoading("Deleting...");
      try {
        await axios.delete(`${API_URL}/production/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        closeSwal();
        showAlert("Deleted!", "success", "Record has been deleted.", "OK");
        fetchData();
      } catch (error) {
        closeSwal();
        showAlert("Error", "error", "Failed to delete record", "OK");
      }
    }
  };

  const handleApprove = async (id) => {
    const result = await showConfirm(
      "Approve QC?",
      "This will mark the batch as Approved.",
      "Yes, Approve!",
    );

    if (result.isConfirmed) {
      showLoading("Approving...");
      try {
        await axios.patch(
          `${API_URL}/production/${id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        closeSwal();
        showAlert("Approved!", "success", "Batch has been approved.", "OK");
        fetchData();
      } catch (error) {
        closeSwal();
        showAlert("Error", "error", "Failed to approve", "OK");
      }
    }
  };

  const handleReject = async (id) => {
    const { value: remarks, isConfirmed } = await showInput(
      "Reject QC",
      "Reason for Rejection",
      "Type your reason here...",
      "Reject Batch",
    );

    if (isConfirmed && remarks) {
      showLoading("Rejecting...");
      try {
        await axios.patch(
          `${API_URL}/production/${id}/reject`,
          { remarks: remarks },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        closeSwal();
        showAlert("Rejected!", "success", "Batch has been rejected.", "OK");
        fetchData();
      } catch (error) {
        closeSwal();
        showAlert("Error", "error", "Failed to reject", "OK");
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => row.creator_name,
        id: "creator_name",
        enableColumnFilter: true,
        enableSorting: true,
        header: "Requestor Name",
        size: 180,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.batch_id,
        id: "batch_id",
        header: "Batch ID",
        enableColumnFilter: true,
        enableSorting: true,
        size: 130,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.product_name,
        id: "product_name",
        header: "Product Name",
        enableColumnFilter: true,
        enableSorting: true,
        size: 200,
      },

      {
        accessorFn: (row) => row.qc_status,
        id: "qc_status",
        header: "QC Status",
        enableColumnFilter: false,
        enableSorting: true,
        size: 150,
        cell: ({ row }) => {
          const statusInt = row.original.qc_status;
          const remarks = row.original.remarks;
          const isRejected = statusInt === 3;

          return (
            <div className="flex flex-col gap-1 items-center text-center w-full">
              {getStatusBadge(statusInt)}
              {isRejected && remarks && (
                <Text
                  size="xs"
                  color="red"
                  className="italic line-clamp-2 mt-1"
                  title={remarks}
                >
                  * {remarks}
                </Text>
              )}
            </div>
          );
        },
      },

      {
        id: "actions",
        header: "Action",
        size: 180,
        cell: ({ row }) => {
          const record = row.original;
          const isPending = record.qc_status === 1 || record.qc_status === null;

          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Tooltip label={canApprove ? "Approve QC" : "No Permission"}>
                <ActionIcon
                  size="md"
                  radius="md"
                  variant="filled"
                  color={canApprove && isPending ? "green" : "gray"}
                  disabled={!canApprove || !isPending}
                  onClick={() => handleApprove(record.id)}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label={canApprove ? "Reject QC" : "No Permission"}>
                <ActionIcon
                  size="md"
                  radius="md"
                  variant="filled"
                  color={canApprove && isPending ? "red" : "gray"}
                  disabled={!canApprove || !isPending}
                  onClick={() => handleReject(record.id)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>

              {(canUpdate || canViewAll) && (
                <Tooltip label="Edit Record">
                  <ActionIcon
                    size="md"
                    radius="md"
                    variant="filled"
                    color="yellow"
                    onClick={() => {
                      const encryptedId = encrypt(record.id.toString());
                      router.push(`/production/edit/${encryptedId}`);
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {(canDelete || canViewAll) && (
                <Tooltip label="Delete Record">
                  <ActionIcon
                    size="md"
                    radius="md"
                    variant="filled"
                    color="red"
                    onClick={() => handleDelete(record.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          );
        },
      },
    ],
    [
      canApprove,
      router,
      showConfirm,
      showAlert,
      showInput,
      showLoading,
      closeSwal,
      encrypt,
    ],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, pagination },
    pageCount: totalPages,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!user || !user.token) {
    return null;
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <IconAlertCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">
          403 - Access Denied
        </h1>
        <Button mt="xl" color="teal" onClick={() => router.push("/dashboard")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Production List | PT. XYZ</title>
      </Head>

      <AuthLayout sidebarList={productionList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                  <IconBuildingFactory size={22} />
                </div>
                <div>
                  <h1 className="text-md font-extrabold text-teal-600 uppercase">
                    Production List
                  </h1>
                </div>
              </div>
            </div>

            <Datatables
              table={table}
              totalPages={totalPages}
              info={{ totalElements: totalRecords }}
            />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
