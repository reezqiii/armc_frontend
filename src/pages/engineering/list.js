import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import { Paper, Badge, Text, Tooltip, Group, ActionIcon } from "@mantine/core";
import {
  IconCheck,
  IconEdit,
  IconTrash,
  IconTools,
  IconX,
} from "@tabler/icons-react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import engineeringList from "@/data/sidebar/EngineeringList";
import useEncrypt from "@/hooks/useEncrypt";
import useSwal from "@/hooks/useSwal";
import usePermission from "@/hooks/usePermission";

export default function EngineeringList() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { encrypt } = useEncrypt();
  const { showAlert, showConfirm, showInput, showLoading, closeSwal } =
    useSwal();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const { can } = usePermission();

  const isAuthorized = can(18);
  const canApprove = can(24);
  const canUpdate = can(22);
  const canDelete = can(23);
  const canViewAll = can(26);

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
        `${API_URL}/engineering/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
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
      "Delete Record",
      "Cannot be undone!",
      "Yes, delete it!",
    );
    if (result.isConfirmed) {
      showLoading("Deleting...");
      try {
        await axios.delete(`${API_URL}/engineering/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        closeSwal();
        showAlert("Deleted!", "success", "Record has been deleted.", "OK");
        fetchData();
      } catch (error) {
        closeSwal();
        showAlert("Error", "error", "Failed to delete record.", "OK");
      }
    }
  };

  const handleApprove = async (id) => {
    const result = await showConfirm(
      "Complete WO?",
      "This will mark the Work Order as Completed.",
      "Yes, Complete!",
    );
    if (result.isConfirmed) {
      showLoading("Updating...");
      try {
        await axios.patch(
          `${API_URL}/engineering/${id}/approve`,
          {},
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        closeSwal();
        showAlert(
          "Completed!",
          "success",
          "Work order marked as completed.",
          "OK",
        );
        fetchData();
      } catch (error) {
        closeSwal();
        showAlert("Error", "error", "Failed to update status.", "OK");
      }
    }
  };

  const handleReject = async (id) => {
    const { value: remarks, isConfirmed } = await showInput(
      "Reject WO",
      "Reason for Rejection",
      "Type your reason here...",
      "Reject",
    );

    if (isConfirmed && remarks) {
      showLoading("Rejecting...");
      try {
        await axios.patch(
          `${API_URL}/engineering/${id}/reject`,
          { remarks: remarks },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        closeSwal();
        showAlert(
          "Rejected!",
          "success",
          "Work order has been rejected.",
          "OK",
        );
        fetchData();
      } catch (error) {
        closeSwal();
        showAlert("Error", "error", "Failed to reject", "OK");
      }
    }
  };

  const getStatusBadge = (statusVal) => {
    let statusText = "Pending by HOD";
    let badgeColor = "orange";

    if (statusVal === 3 || statusVal === "Completed by HOD") {
      statusText = "Completed by HOD";
      badgeColor = "teal";
    } else if (statusVal === 4 || statusVal === "Rejected by HOD") {
      statusText = "Rejected by HOD";
      badgeColor = "red";
    } else if (statusVal === 2 || statusVal === "In Progress by HOD") {
      statusText = "In Progress by HOD";
      badgeColor = "blue";
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
        accessorFn: (row) => row.wo_number,
        id: "wo_number",
        header: "WO Number",
        enableColumnFilter: true,
        enableSorting: true,
        size: 130,
        cell: (info) => info.getValue() ?? "-",
      },
      {
        accessorFn: (row) => row.equipment_name,
        id: "equipment_name",
        header: "Equipment",
        enableColumnFilter: true,
        enableSorting: true,
        size: 200,
      },
      {
        accessorFn: (row) => row.priority,
        id: "priority",
        header: "Priority",
        size: 100,
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ getValue }) => {
          const val = getValue();
          let priorityText = "Low";
          let badgeColor = "blue";

          if (val === 3 || val === "High") {
            priorityText = "High";
            badgeColor = "red";
          } else if (val === 2 || val === "Medium") {
            priorityText = "Medium";
            badgeColor = "orange";
          }

          return (
            <Badge color={badgeColor} variant="light">
              {priorityText}
            </Badge>
          );
        },
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
          const isRejected = statusInt === 4 || statusInt === "Rejected";

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

          const isPending = record.status === 1 || record.status === 2;
          const id = record.id_wo;

          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Tooltip
                label={canApprove ? "Complete WO" : "No Permission"}
                withArrow
              >
                <ActionIcon
                  size="md"
                  radius="md"
                  variant="filled"
                  color={canApprove && isPending ? "green" : "gray"}
                  disabled={!canApprove || !isPending}
                  onClick={() => handleApprove(id)}
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Tooltip>

              <Tooltip
                label={canApprove ? "Reject WO" : "No Permission"}
                withArrow
              >
                <ActionIcon
                  size="md"
                  radius="md"
                  variant="filled"
                  color={canApprove && isPending ? "red" : "gray"}
                  disabled={!canApprove || !isPending}
                  onClick={() => handleReject(id)}
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
                    onClick={() => {
                      const encryptedId = encrypt(id.toString());
                      router.push(`/engineering/edit/${encryptedId}`);
                    }}
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
                    onClick={() => handleDelete(id)}
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

  return (
    <>
      <Head>
        <title>Engineering | PT. XYZ</title>
      </Head>
      <AuthLayout sidebarList={engineeringList}>
        <div className="py-6 px-4">
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center justify-between border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                  <IconTools size={22} />
                </div>
                <div>
                  <h1 className="text-md font-extrabold text-teal-700 uppercase">
                    Engineering List
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
