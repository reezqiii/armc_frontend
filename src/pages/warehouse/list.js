import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import { Paper, Button, Group, Text, Badge } from "@mantine/core";
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconPackages,
  IconX,
} from "@tabler/icons-react";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Datatables from "@/components/custom/Datatables";
import warehouseList from "@/data/sidebar/WarehouseList";
import useEncrypt from "@/hooks/useEncrypt";

export default function WarehouseList() {
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
    if (user?.token) fetchData();
  }, [fetchData, user?.token]);

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
        fetchData();
      } catch (error) {
        Swal.fire("Error", "Failed to delete item.", "error");
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
        accessorFn: (row) => row.item_code,
        id: "item_code",
        header: "Code",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => (
          <Text fw={700} color="teal">
            {row.original.item_code}
          </Text>
        ),
      },
      {
        accessorFn: (row) => row.item_name,
        id: "item_name",
        header: "Item Name",
        enableColumnFilter: true,
        enableSorting: true,
      },

      {
        accessorFn: (row) => row.quantity,
        id: "quantity",
        header: "Qty",
        enableColumnFilter: true,
        enableSorting: true,
        cell: ({ row }) => (
          <Text fw={500}>
            {row.original.quantity} {row.original.unit || ""}
          </Text>
        ),
      },
      {
        accessorFn: (row) => row.location,
        id: "location",
        header: "Location",
        enableColumnFilter: true,
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Action",
        enableColumnFilter: false,
        enableSorting: true,
        size: 150,
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
                onClick={() => router.push(`/warehouse/edit/${encryptedId}`)}
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
    [encrypt, router],
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
