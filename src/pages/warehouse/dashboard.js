import React, { useState, useEffect, useMemo, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Swal from "sweetalert2";
import { Paper, Button, Group, Text, Badge } from "@mantine/core";
import { IconPlus, IconEdit, IconX, IconPackages } from "@tabler/icons-react";
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

    const params = new URLSearchParams({
      page: pagination.pageIndex,
      size: pagination.pageSize,
    });

    if (sorting.length > 0) {
      params.append(
        "sort",
        `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`,
      );
    }

    if (columnFilters.length > 0) {
      const searchObj = {};
      columnFilters.forEach((filter) => {
        if (
          filter.value !== undefined &&
          filter.value !== null &&
          filter.value !== ""
        ) {
          searchObj[filter.id] = filter.value;
        }
      });

      if (Object.keys(searchObj).length > 0) {
        params.append("search", JSON.stringify(searchObj));
      }
    }

    try {
      const response = await axios.post(
        `${API_URL}/warehouse/serverside_list?${params.toString()}`,
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
        accessorFn: (row) => row.item_code,
        id: "item_code",
        header: "Code",
        size: 120,
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
        size: 250,
      },
      {
        accessorFn: (row) => row.creator_name,
        id: "creator_name",
        header: "Created By",
        size: 200,
        cell: ({ getValue }) => {
          const name = getValue();
          return name ? (
            <Badge variant="dot" color="blue" radius="sm">
              {name}
            </Badge>
          ) : (
            <Text size="sm" color="dimmed">
              -
            </Text>
          );
        },
      },
      {
        accessorFn: (row) => row.quantity,
        id: "quantity",
        header: "Qty",
        size: 100,
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
        size: 150,
      },
      {
        id: "actions",
        header: "Action",
        size: 150,
        cell: ({ row }) => {
          const record = row.original;
          const encryptedId = encrypt(record.id.toString());

          return (
            <Group gap={6} justify="center" wrap="nowrap">
              <Button
                size="xs"
                color="blue"
                px={10}
                leftSection={<IconEdit size={14} />}
                onClick={() => router.push(`/warehouse/edit/${encryptedId}`)}
              >
                Edit
              </Button>

              <Button
                size="xs"
                color="red"
                px={10}
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
            totalPages={totalPages}
            info={{ totalElements: totalRecords }}
          />
        </Paper>
      </div>
    </AuthLayout>
  );
}
