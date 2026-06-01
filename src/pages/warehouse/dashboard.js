import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Paper,
  Text,
  SimpleGrid,
  Group,
  ThemeIcon,
  Button,
} from "@mantine/core";
import {
  IconPackages,
  IconAlertTriangle,
  IconChecklist,
  IconX,
  IconActivity,
  IconAlertCircle,
} from "@tabler/icons-react";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import usePermission from "@/hooks/usePermission";
import warehouseList from "@/data/sidebar/WarehouseList";

export default function WarehouseDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { can } = usePermission();

  const [records, setRecords] = useState([]);
  const isAuthorized = can(20);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_URL}/warehouse/serverside_list?page=0&size=100`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      const result = response.data.data || [];
      setRecords(result);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setRecords([]);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (isAuthorized && user?.token) {
      fetchData();
    }
  }, [fetchData, isAuthorized, user?.token]);

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
      value: safeRecords.filter(
        (r) => Number(r.quantity) > 0 && Number(r.quantity) < 20,
      ).length,
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

  const recentActivities = [...safeRecords].slice(0, 4).map((record) => {
    let actionText = "";
    let statusKey = "";

    if (record.status === 2) {
      actionText = `has been approved and added to inventory.`;
      statusKey = "Approved";
    } else if (record.status === 3) {
      actionText = `request was rejected by supervisor.`;
      statusKey = "Rejected";
    } else {
      actionText = `is waiting for supervisor approval.`;
      statusKey = "Pending";
    }

    return {
      id: record.id || record.id_warehouse,
      text: `Item [${record.item_code}] ${record.item_name} ${actionText}`,
      status: statusKey,
    };
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
        <Button
          mt="xl"
          color="teal"
          variant="light"
          onClick={() => router.push("/dashboard")}
        >
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Warehouse Dashboard | PT. XYZ</title>
      </Head>

      <AuthLayout sidebarList={warehouseList}>
        <div className="py-6 px-4">
          <Paper
            radius="md"
            p="lg"
            withBorder
            shadow="sm"
            className="mb-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white"
          >
            <Text size="xl" fw={700} className="mb-1">
              Warehouse Dashboard
            </Text>
            <Text size="sm" className="opacity-90">
              Monitor inventory levels, track stock movements, and manage
              warehouse items in real-time.
            </Text>
          </Paper>

          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 4 }}
            spacing="lg"
            className="mb-6"
          >
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

          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <IconActivity size={20} className="text-teal-600" />
              <Text fw={600} className="text-gray-700">
                Recent Inventory Updates
              </Text>
            </div>

            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 bg-gray-50 p-4 rounded-md border border-gray-100"
                  >
                    <div
                      className={`w-1.5 h-8 rounded-full ${
                        activity.status === "Approved"
                          ? "bg-teal-500"
                          : activity.status === "Rejected"
                            ? "bg-red-500"
                            : "bg-orange-500"
                      }`}
                    />
                    <Text size="sm" fw={500} className="text-gray-800 flex-1">
                      {activity.text}
                    </Text>
                  </div>
                ))
              ) : (
                <Text size="sm" color="dimmed" align="center" py="md">
                  No recent inventory activities found.
                </Text>
              )}
            </div>
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
