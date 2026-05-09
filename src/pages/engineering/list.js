import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import { Paper, Badge, Button, Group, Text, Tooltip } from "@mantine/core";
import {
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconTools,
} from "@tabler/icons-react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import engineeringList from "@/data/sidebar/EngineeringList";
import useEncrypt from "@/hooks/useEncrypt";

export default function EngineeringList() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { encrypt } = useEncrypt();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const canApprove = true;

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
    if (user?.token) fetchData();
  }, [fetchData, user?.token]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete?",
      text: "Cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/engineering/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        Swal.fire("Deleted!", "Record has been deleted.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to delete record.", "error");
      }
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Mark as Completed?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#20c997",
    });
    if (result.isConfirmed) {
      try {
        await axios.put(
          `${API_URL}/engineering/${id}`,
          { status: "Completed" },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        Swal.fire("Completed!", "Work order marked as completed.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to update status.", "error");
      }
    }
  };

  const getStatusBadge = (statusVal) => {
    let statusText = "Pending";
    let badgeColor = "orange";

    if (statusVal === 3 || statusVal === "Completed") {
      statusText = "Completed";
      badgeColor = "teal";
    } else if (statusVal === 2 || statusVal === "In Progress") {
      statusText = "In Progress";
      badgeColor = "blue";
    } else if (statusVal === 1 || statusVal === "Pending") {
      statusText = "Pending";
      badgeColor = "orange";
    }

    return (
      <Badge color={badgeColor} variant="light">
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
        size: 200,
        cell: ({ getValue }) => (
          <Text size="sm" fw={500}>
            {getValue() || "-"}
          </Text>
        ),
      },
      {
        accessorFn: (row) => row.wo_number,
        id: "wo_number",
        header: "WO Number",
        enableColumnFilter: true,
        enableSorting: true,
        size: 130,
        cell: ({ row }) => (
          <Text fw={700} color="teal" size="sm">
            {row.original.wo_number}
          </Text>
        ),
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
        size: 120,
        cell: ({ getValue }) => getStatusBadge(getValue()), 
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,
        enableSorting: true,
        size: 280,
        cell: ({ row }) => {
          const record = row.original;
          const isCompleted = record.status === "Completed";
          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Tooltip
                label={canApprove ? "Complete WO" : "Role not permitted"}
                withArrow
              >
                <Button
                  size="xs"
                  color={canApprove && !isCompleted ? "green" : "gray"}
                  disabled={!canApprove || isCompleted}
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleApprove(record.id)}
                >
                  Complete
                </Button>
              </Tooltip>

              <Button
                size="xs"
                color="blue"
                leftSection={<IconEdit size={14} />}
                onClick={() => {
                  const encryptedId = encrypt(record.id.toString());
                  router.push(`/engineering/edit/${encryptedId}`);
                }}
              >
                Edit
              </Button>

              <Tooltip
                label={canApprove ? "Delete Record" : "Role not permitted"}
                withArrow
              >
                <Button
                  size="xs"
                  color={canApprove ? "red" : "gray"}
                  disabled={!canApprove}
                  leftSection={<IconTrash size={14} />}
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </Button>
              </Tooltip>
            </Group>
          );
        },
      },
    ],
    [canApprove, router, encrypt],
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
