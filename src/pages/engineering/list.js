import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import { Paper, Badge, Button, Group, Text } from "@mantine/core";
import {
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconTools,
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
import engineeringList from "@/data/sidebar/EngineeringList";
import useEncrypt from "@/hooks/useEncrypt";


export default function EngineeringList() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();

  // 2. PANGGIL HOOK ENCRYPT
  const { encrypt } = useEncrypt();

  const [data, setData] = useState([]);

  // RBAC BYPASS (Bisa diklik semua)
  const canApprove = true;

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/engineering`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(response.data);
    } catch (error) {
      console.error("Fetch data error", error);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (user?.token) fetchData();
  }, [fetchData, user?.token]);

  // --- FUNGSI DELETE & APPROVE TETAP ADA DI SINI ---
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

  // --- TABLE CONFIG ---
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "wo_number",
        header: "WO Number",
        size: 130,
        cell: ({ row }) => (
          <Text fw={700} color="teal" size="sm">
            {row.original.wo_number}
          </Text>
        ),
      },
      { accessorKey: "equipment_name", header: "Equipment", size: 200 },
      {
        accessorKey: "priority",
        header: "Priority",
        size: 100,
        cell: ({ row }) => (
          <Badge
            color={row.original.priority === "High" ? "red" : "blue"}
            variant="light"
          >
            {row.original.priority}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        cell: ({ row }) => (
          <Badge
            color={row.original.status === "Completed" ? "teal" : "orange"}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Action",
        size: 280,
        cell: ({ row }) => {
          const record = row.original;
          const isCompleted = record.status === "Completed";
          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Button
                size="xs"
                color={canApprove && !isCompleted ? "green" : "gray"}
                disabled={!canApprove || isCompleted}
                leftSection={<IconCheck size={14} />}
                onClick={() => handleApprove(record.id)}
              >
                Complete
              </Button>

              {/* 3. TOMBOL EDIT SEKARANG MENGGUNAKAN ID TERENKRIPSI */}
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

              <Button
                size="xs"
                color={canApprove ? "red" : "gray"}
                disabled={!canApprove}
                leftSection={<IconTrash size={14} />}
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Button>
            </Group>
          );
        },
      },
    ],
    [canApprove, router, encrypt], // Jangan lupa masukkan 'encrypt' ke dependencies
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

              <Button
                color="teal"
                size="xs"
                leftSection={<IconPlus size={16} />}
                onClick={() => router.push("/engineering/add")} // *Catatan: pastikan URL ini match dengan file kamu, saya sesuaikan jadi /engineering/add agar rapi
              >
                New Engineering
              </Button>
            </div>

            <Datatables
              table={table}
              totalPages={table.getPageCount()}
              info={{ totalElements: data.length }}
            />
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
