import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Paper,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Button,
} from "@mantine/core";
import {
  IconEdit,
  IconTrash,
  IconPackages,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import warehouseList from "@/data/sidebar/WarehouseList";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";
import usePermission from "@/hooks/usePermission";

export default function WarehouseList() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { encrypt } = useEncrypt();
  const { showAlert, showConfirm, showInput, showLoading, closeSwal } =
    useSwal();
  const { can } = usePermission();

  const isAuthorized = can(20);
  const canApprove = can(39);
  const canUpdate = can(37);
  const canDelete = can(38);
  const canViewAll = can(35);

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

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
        `${API_URL}/warehouse/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      const responseData = response.data;
      setData(responseData.data || []);
      setTotalPages(responseData.total_pages || 0);
      setTotalRecords(responseData.total_records || 0);
    } catch (error) {
      console.error("Fetch data error", error);
    }
  }, [
    API_URL,
    user?.token,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    columnFilters,
  ]);

  useEffect(() => {
    if (isAuthorized && user?.token) fetchData();
  }, [fetchData, isAuthorized, user?.token]);

  const handleDelete = async (id) => {
    const result = await showConfirm(
      "Delete Record?",
      "Are you sure you want to delete this record? This action cannot be undone.",
      "Yes, Delete!",
    );

    if (result.isConfirmed) {
      showLoading();
      try {
        const encryptedId = encrypt(id.toString());
        await axios.delete(`${API_URL}/warehouse/${encryptedId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        closeSwal();
        showAlert(
          "Deleted!",
          "success",
          "The record has been successfully deleted.",
        );
        fetchData();
      } catch (error) {
        closeSwal();
        console.error("Delete error:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to delete the record.";
        showAlert("Error", "error", errorMsg);
      }
    }
  };
  const handleApprove = async (id) => {
    const result = await showConfirm(
      "Approve Item?",
      "Are you sure you want to approve this item?",
      "Yes, Approve!",
    );
    if (result.isConfirmed) {
      showLoading();
      try {
        const encryptedId = encrypt(id.toString());
        await axios.patch(
          `${API_URL}/warehouse/${encryptedId}/approve`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        closeSwal();
        showAlert(
          "Success!",
          "success",
          "The item has been successfully approved.",
        );
        fetchData();
      } catch (error) {
        closeSwal();
        console.error("Approve error:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to approve the item.";
        showAlert("Error", "error", errorMsg);
      }
    }
  };

  const handleReject = async (id) => {
    const result = await showInput(
      "Reject Item?",
      "Please provide a reason for rejection:",
      "Enter reason here...",
      "Reject Item",
    );

    if (result.isConfirmed) {
      showLoading();
      try {
        const encryptedId = encrypt(id.toString());

        await axios.patch(
          `${API_URL}/warehouse/${encryptedId}/reject`,
          { remarks: result.value },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );

        closeSwal();
        showAlert(
          "Success!",
          "success",
          "The item has been successfully rejected.",
        );
        fetchData();
      } catch (error) {
        closeSwal();
        console.error("Reject error:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to reject the item.";
        showAlert("Error", "error", errorMsg);
      }
    }
  };

  const getStatusBadge = (statusVal) => {
    let statusText = "Pending by HOD";
    let badgeColor = "orange";

    if (statusVal === 2) {
      statusText = "Approved by HOD";
      badgeColor = "teal";
    } else if (statusVal === 3) {
      statusText = "Rejected by HOD";
      badgeColor = "red";
    }

    return (
      <Badge color={badgeColor} variant="filled" radius="sm">
        {statusText}
      </Badge>
    );
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
        accessorFn: (row) => row.item_code,
        id: "item_code",
        header: "Code",
        enableColumnFilter: true,
        enableSorting: true,
        size: 120,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.item_name,
        id: "item_name",
        header: "Item Name",
        enableColumnFilter: true,
        enableSorting: true,
        size: 200,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.category,
        id: "category",
        header: "Category",
        enableColumnFilter: true,
        enableSorting: true,
        size: 150,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.quantity,
        id: "quantity",
        header: "Qty",
        enableColumnFilter: true,
        enableSorting: true,
        size: 80,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.location,
        id: "location",
        header: "Location",
        enableColumnFilter: true,
        enableSorting: true,
        size: 150,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        enableColumnFilter: false,
        enableSorting: true,
        size: 150,
        cell: ({ row }) => {
          const statusInt = row.original.status;
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
        enableColumnFilter: false,
        enableSorting: false,
        size: 180,
        cell: ({ row }) => {
          const record = row.original;
          const encryptedId = encrypt(record.id.toString());
          const currentStatus = Number(record.status);
          const isPending =
            currentStatus === 1 ||
            currentStatus === 0 ||
            record.status === null;

          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Tooltip
                label={canApprove ? "Approve Item" : "No Permission"}
                withArrow
              >
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

              <Tooltip
                label={canApprove ? "Reject Item" : "No Permission"}
                withArrow
              >
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
                <Tooltip label="Edit Record" withArrow>
                  <ActionIcon
                    size="md"
                    radius="md"
                    variant="filled"
                    color="yellow"
                    onClick={() =>
                      router.push(`/warehouse/edit/${encryptedId}`)
                    }
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {(canDelete || canViewAll) && (
                <Tooltip label="Delete Record" withArrow>
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
    [canApprove, canUpdate, canDelete, canViewAll, router, encrypt],
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
    <AuthLayout sidebarList={warehouseList}>
      <Head>
        <title>Inventory List | PT. XYZ</title>
      </Head>
      <div className="py-6 px-4">
        <Paper radius="md" p="md" withBorder shadow="sm">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <Group>
              <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                <IconPackages size={22} />
              </div>
              <Text fw={800} color="teal" className="uppercase text-md">
                Inventory List
              </Text>
            </Group>
          </div>

          <Datatables
            table={table}
            totalPages={totalPages}
            info={{ totalElements: totalRecords }}
          />
        </Paper>
      </div>
    </AuthLayout>
  );
}
