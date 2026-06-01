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
  IconTools,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
  IconActivity,
  IconAlertCircle,
} from "@tabler/icons-react";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import usePermission from "@/hooks/usePermission";
import engineeringList from "@/data/sidebar/EngineeringList";

export default function EngineeringDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();
  const { can } = usePermission();

  const [records, setRecords] = useState([]);
  const isAuthorized = can(18);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_URL}/engineering/serverside_list?page=0&size=100`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      const result = response.data.data || [];
      setRecords(result);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      setRecords([]);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (isAuthorized && user?.token) {
      fetchData();
    }
  }, [fetchData, isAuthorized, user?.token]);

  const totalWO = records.length;
  const pendingWO = records.filter((r) => r.status === 1).length;
  const progressWO = records.filter((r) => r.status === 2).length;
  const completedWO = records.filter((r) => r.status === 3).length;

  const stats = [
    {
      title: "Total Work Orders",
      value: totalWO,
      icon: IconTools,
      color: "blue",
    },
    {
      title: "Pending",
      value: pendingWO,
      icon: IconAlertTriangle,
      color: "orange",
    },
    { title: "In Progress", value: progressWO, icon: IconClock, color: "blue" },
    {
      title: "Completed",
      value: completedWO,
      icon: IconCircleCheck,
      color: "teal",
    },
  ];

  const recentActivities = [...records].slice(0, 4).map((record) => {
    let actionText = "";
    let statusKey = "";

    if (record.status === 3) {
      actionText = `has been completed and verified.`;
      statusKey = "Completed";
    } else if (record.status === 4) {
      actionText = `was rejected by supervisor.`;
      statusKey = "Rejected";
    } else {
      actionText = `is currently being processed.`;
      statusKey = "Pending";
    }

    return {
      id: record.id_wo,
      text: `WO #${record.wo_number} (${record.equipment_name}) ${actionText}`,
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
        <title>Engineering Dashboard | PT. XYZ</title>
      </Head>

      <AuthLayout sidebarList={engineeringList}>
        <div className="py-6 px-4">
          <Paper
            radius="md"
            p="lg"
            withBorder
            shadow="sm"
            className="mb-6 bg-gradient-to-r from-teal-500 to-teal-700 text-white"
          >
            <Text size="xl" fw={700} className="mb-1">
              Engineering Dashboard
            </Text>
            <Text size="sm" className="opacity-90">
              Monitor maintenance requests and equipment work orders in
              real-time.
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
                  <Text
                    size="xs"
                    color="dimmed"
                    className="font-semibold uppercase"
                  >
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
                <Group align="flex-end" mt={25}>
                  <Text className="text-3xl font-bold">{stat.value}</Text>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>

          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <IconActivity size={20} className="text-teal-600" />
              <Text fw={600} className="text-gray-700">
                Recent Maintenance Updates
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
                        activity.status === "Completed"
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
                  No recent maintenance activities found.
                </Text>
              )}
            </div>
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
