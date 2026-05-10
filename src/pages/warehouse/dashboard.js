import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import axios from "axios";
import {
  Paper,
  Text,
  SimpleGrid,
  Group,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import {
  IconPackages,
  IconAlertTriangle,
  IconChecklist,
  IconX,
} from "@tabler/icons-react";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import warehouseList from "@/data/sidebar/WarehouseList";

export default function WarehouseDashboard() {
  const { user } = useUser();
  const { API_URL } = useApi();
  const [records, setRecords] = useState([]);

  const currentUserRole = user?.role_name || "Unknown Role";

  const fetchData = useCallback(async () => {
    try {
      // Mengambil data dari endpoint warehouse
      const response = await axios.get(`${API_URL}/warehouse`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      // SABUK PENGAMAN: Karena backend sekarang mengembalikan { data: [...] }
      // Kita pastikan mengambil array-nya saja
      if (response.data && Array.isArray(response.data.data)) {
        setRecords(response.data.data);
      } else if (Array.isArray(response.data)) {
        setRecords(response.data);
      } else {
        setRecords([]);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setRecords([]);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (user?.token) fetchData();
  }, [fetchData, user?.token]);

  // Pastikan variabel records selalu berupa array sebelum di-filter
  const safeRecords = Array.isArray(records) ? records : [];

  const stats = [
    {
      title: "Total Items",
      value: safeRecords.length,
      icon: IconPackages,
      color: "blue",
    },
    {
      title: "Out of Stock",
      value: safeRecords.filter((r) => Number(r.quantity) === 0).length,
      icon: IconX,
      color: "red",
    },
    {
      title: "Low Stock",
      value: safeRecords.filter((r) => Number(r.quantity) > 0 && Number(r.quantity) < 20).length,
      icon: IconAlertTriangle,
      color: "orange",
    },
    {
      title: "In Stock",
      value: safeRecords.filter((r) => Number(r.quantity) >= 20).length,
      icon: IconChecklist,
      color: "teal",
    },
  ];

  return (
    <>
      <Head>
        <title>Warehouse Dashboard | PT. XYZ</title>
      </Head>

      <AuthLayout sidebarList={warehouseList}>
        <div className="py-6 px-4">
          {/* WELCOME BANNER */}
          <Paper
            radius="md"
            p="lg"
            withBorder
            shadow="sm"
            className="mb-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white"
          >
            <Group justify="space-between" align="center">
              <div>
                <Text size="xl" fw={700} className="mb-1">
                  Warehouse Dashboard
                </Text>
                <Text size="sm" className="opacity-90">
                  Monitor inventory levels, track stock movements, and manage warehouse items in real-time.
                </Text>
              </div>
              <Badge color="white" variant="light" size="lg" radius="sm">
                <Text color="teal" fw={700}>
                  Role: {currentUserRole}
                </Text>
              </Badge>
            </Group>
          </Paper>

          {/* STATS CARDS */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {stats.map((stat) => (
              <Paper withBorder p="md" radius="md" shadow="sm" key={stat.title}>
                <Group justify="space-between">
                  <Text size="xs" color="dimmed" fw={700} tt="uppercase">
                    {stat.title}
                  </Text>
                  <ThemeIcon
                    color={stat.color}
                    variant="light"
                    size={38}
                    radius="md"
                  >
                    <stat.icon size={20} />
                  </ThemeIcon>
                </Group>
                <Text className="text-3xl font-bold" mt={20}>
                  {stat.value}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </div>
      </AuthLayout>
    </>
  );
}