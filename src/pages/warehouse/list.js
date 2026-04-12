import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router"; // 1. Tambahkan useRouter
import axios from "axios";
import Swal from "sweetalert2";
import { Paper, Button, Group, Text } from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPackages,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import warehouseList from "@/data/sidebar/WarehouseList";

// 2. IMPORT USEENCRYPT
import useEncrypt from "@/hooks/useEncrypt";

export default function WarehouseList() {
  const router = useRouter(); // Inisialisasi router
  const { user } = useUser();
  const { API_URL } = useApi();

  // Panggil hook encrypt
  const { encrypt } = useEncrypt();

  const [data, setData] = useState([]);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/warehouse`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(res.data);
    } catch (error) {
      console.error("Fetch data error", error);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (user?.token) fetchData();
  }, [fetchData, user?.token]);

  // --- FUNGSI DELETE (Dipisah agar rapi) ---
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Item?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/warehouse/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        Swal.fire("Deleted!", "Item has been deleted.", "success");
        fetchData(); // Refresh data
      } catch (error) {
        Swal.fire("Error", "Failed to delete item.", "error");
      }
    }
  };

  // --- TABLE CONFIG ---
  const columns = useMemo(
    () => [
      {
        accessorKey: "item_code",
        header: "Code",
        cell: ({ row }) => (
          <Text fw={700} color="teal">
            {row.original.item_code}
          </Text>
        ),
      },
      { accessorKey: "item_name", header: "Item Name" },
      {
        accessorKey: "quantity",
        header: "Qty",
        cell: ({ row }) => (
          <Text>
            {row.original.quantity} {row.original.unit}
          </Text>
        ),
      },
      { accessorKey: "location", header: "Location" },
      {
        id: "actions",
        header: "Action",
        size: 100,
        cell: ({ row }) => {
          const record = row.original;
          const encryptedId = encrypt(record.id.toString());

          return (
            <Group gap={4} justify="center" wrap="nowrap">
              <Button
                size="xs"
                color="blue"
                px={8}
                leftSection={<IconEdit size={14} />}
                onClick={() =>
                  router.push(`/warehouse/edit/${encryptedId}`)
                }
              >
                Edit
              </Button>

              <Button
                size="xs"
                color="red"
                px={8}
                leftSection={<IconX size={14} />}
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Button>
            </Group>
          );
        },
      },
    ], 
    [encrypt, router], // Dependencies useMemo
  ); // Tutup useMemo

  // Sekarang panggil table setelah columns didefinisikan dengan benar
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
              <Text fw={800} color="teal" className="uppercase">
                Inventory List
              </Text>
            </Group>

            {/* TOMBOL ADD PINDAH HALAMAN */}
            <Button
              color="teal"
              size="xs"
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push("/warehouse/add_warehouse")}
            >
              Add Item
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
  );
}
