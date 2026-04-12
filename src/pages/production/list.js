import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router"; // Tambahkan useRouter
import axios from "axios";
import Swal from "sweetalert2";
import { Paper, Badge, Button, Group, Text, Tooltip } from "@mantine/core";
import {
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconBuildingFactory,
} from "@tabler/icons-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import productionList from "@/data/sidebar/ProductionList";
import useEncrypt from "@/hooks/useEncrypt";

export default function ProductionList() {
  const router = useRouter(); // Inisialisasi router
  const { user } = useUser();
  const { API_URL } = useApi();
  const { encrypt } = useEncrypt();
  const [data, setData] = useState([]);

  // Secara default diset true agar halaman selalu terbuka
  const [isAuthorized, setIsAuthorized] = useState(true);

  // --- 1. LOGIKA RBAC (SEMENTARA DINONAKTIFKAN) ---
  const currentUserRole = user?.role_name || "Unknown Role";
  const canApprove = true; // Dibuat TRUE secara paksa untuk demo

  // --- 2. FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/production`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (isAuthorized && user?.token) {
      fetchData();
    }
  }, [fetchData, isAuthorized, user?.token]);

  // --- 3. FUNGSI APPROVE & DELETE ---
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
          { qc_status: "Passed" },
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        Swal.fire("Approved!", "Batch has been passed.", "success");
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to approve", "error");
      }
    }
  };

  // --- 4. KONFIGURASI TABLE ---
  const [columnFilters, setColumnFilters] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Passed":
        return (
          <Badge
            color="teal"
            radius="sm"
            styles={{ root: { textTransform: "none" } }}
          >
            {status}
          </Badge>
        );
      case "Failed":
        return (
          <Badge
            color="red"
            radius="sm"
            styles={{ root: { textTransform: "none" } }}
          >
            {status}
          </Badge>
        );
      default:
        return (
          <Badge
            color="orange"
            radius="sm"
            styles={{ root: { textTransform: "none" } }}
          >
            {status}
          </Badge>
        );
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "batch_id",
        header: "Batch ID",
        size: 150,
        cell: ({ row }) => (
          <Text fw={700} color="teal" size="sm">
            {row.original.batch_id}
          </Text>
        ),
      },
      { accessorKey: "product_name", header: "Product Name", size: 300 },
      {
        accessorKey: "created_at",
        header: "Date",
        size: 150,
        cell: ({ row }) => (
          <Text size="sm">
            {" "}
            {new Date(row.original.created_at).toLocaleDateString()}
          </Text>
        ),
      },
      {
        accessorKey: "qc_status",
        header: "QC Status",
        size: 150,
        cell: (info) => getStatusBadge(info.getValue()),
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => {
          const record = row.original;
          const isPending = record.qc_status === "Pending";

          return (
            <Group gap={6} justify="center" wrap="nowrap">
              {/* Tombol Approve */}
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

              {/* TOMBOL EDIT PINDAH HALAMAN */}
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

              {/* Tombol Delete */}
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
                  style={{ cursor: !canApprove ? "not-allowed" : "pointer" }}
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = table.getPageCount();
  const tableInfo = { totalElements: data.length };

  // --- 5. RENDER UI ---
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <IconAlertCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">
          403 - Access Denied
        </h1>
        <p className="text-gray-500 mt-2">
          Your role cannot access this module.
        </p>
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
            {/* HEADER */}
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

              {/* TOMBOL ADD PINDAH HALAMAN */}
              <Button
                color="teal"
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/production/add_production")}
              >
                Add New Record
              </Button>
            </div>

            {/* TABLE */}
            <Datatables
              table={table}
              totalPages={totalPages}
              info={tableInfo}
            />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
