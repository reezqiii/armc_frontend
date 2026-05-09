import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, Text, Badge, Tooltip, Group } from "@mantine/core";
import {
  IconBuildingFactory,
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useEncrypt from "@/hooks/useEncrypt";
import Head from "next/head";
import productionList from "@/data/sidebar/ProductionList";
import Swal from "sweetalert2";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import Datatables from "@/components/custom/Datatables";

export default function ProductionList() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { encrypt } = useEncrypt();

  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const [isAuthorized, setIsAuthorized] = useState(true);
  const currentUserRole = user?.role_name || "Unknown Role";
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
        `${API_URL}/production/serverside_list?${filterParams}&page=${pagination.pageIndex}&size=${pagination.pageSize}&sort=${sort}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      const responseData = response.data;

      setData(responseData.data);
      setTotalPages(responseData.total_pages);
      setTotalRecords(responseData.total);
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
    if (statusInt === 2) return "Passed";
    if (statusInt === 3) return "Failed";
    return "Pending";
  };

  const getStatusBadge = (statusInt) => {
    const statusText = getStatusString(statusInt);
    switch (statusText) {
      case "Passed":
        return (
          <Badge color="teal" radius="sm">
            {statusText}
          </Badge>
        );
      case "Failed":
        return (
          <Badge color="red" radius="sm">
            {statusText}
          </Badge>
        );
      default:
        return (
          <Badge color="orange" radius="sm">
            {statusText}
          </Badge>
        );
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will not be able to recover this record!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/production/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        Swal.fire("Deleted!", "Record has been deleted.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to delete", "error");
      }
    }
  };

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve QC?",
      text: "This will mark the batch as Passed.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#20c997",
      confirmButtonText: "Yes, Approve!",
    });

    if (result.isConfirmed) {
      try {
        await axios.put(
          `${API_URL}/production/${id}`,
          { qc_status: 2 },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        Swal.fire("Approved!", "Batch has been passed.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to approve", "error");
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
        size: 200,
        cell: ({ getValue }) => (
          <Text size="sm" fw={500}>
            {getValue() || "-"}
          </Text>
        ),
      },
      {
        accessorFn: (row) => row.batch_id,
        id: "batch_id",
        header: "Batch ID",
        enableColumnFilter: true,
        enableSorting: true,
        size: 150,
        cell: ({ row }) => (
          <Text fw={700} c="teal" size="sm">
            {row.original.batch_id}
          </Text>
        ),
      },
      {
        accessorFn: (row) => row.product_name,
        id: "product_name",
        header: "Product Name",
        enableColumnFilter: true,
        enableSorting: true,
        size: 300,
      },
      {
        accessorFn: (row) => row.qc_status,
        id: "qc_status",
        header: "QC Status",
        enableColumnFilter: false,
        enableSorting: true,
        size: 150,
        cell: ({ getValue }) => getStatusBadge(getValue()),
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,
        enableSorting: true,
        cell: ({ row }) => {
          const record = row.original;

          const isPending = record.qc_status === 1 || record.qc_status === null;

          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Tooltip
                label={canApprove ? "Approve QC" : "Role not permitted"}
                withArrow
              >
                <Button
                  size="xs"
                  color={canApprove && isPending ? "green" : "gray"}
                  disabled={!canApprove || !isPending}
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleApprove(record.id)}
                  style={{
                    cursor:
                      !canApprove || !isPending ? "not-allowed" : "pointer",
                  }}
                >
                  Approve
                </Button>
              </Tooltip>

              <Button
                size="xs"
                color="blue"
                leftSection={<IconEdit size={14} />}
                onClick={() => {
                  const encryptedId = encrypt(record.id.toString());

                  router.push(`/production/edit/${encryptedId}`);
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
                  style={{
                    cursor: !canApprove ? "not-allowed" : "pointer",
                  }}
                >
                  Delete
                </Button>
              </Tooltip>
            </Group>
          );
        },
      },
    ],
    [canApprove, router],
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
                  <p className="text-xs text-gray-500">
                    Logged in as:{" "}
                    <span className="font-semibold text-teal-600">
                      {currentUserRole}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Pastikan Datatables kamu support manual pagination properties */}
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
