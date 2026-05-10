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
  Badge,
  Button,
} from "@mantine/core";
import {
  IconBuildingFactory,
  IconChecklist,
  IconX,
  IconClock,
  IconAlertCircle,
  IconActivity,
} from "@tabler/icons-react";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import productionList from "@/data/sidebar/ProductionList";

export default function ProductionDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();

  const [isAuthorized, setIsAuthorized] = useState(true);
  const [records, setRecords] = useState([]);

  const currentUserRole = user?.role_name || "Unknown Role";

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/production`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (Array.isArray(response.data)) {
        setRecords(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setRecords(response.data.data);
      } else {
        console.warn("API did not return an array:", response.data);
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (isAuthorized && user?.token) {
      fetchData();
    }
  }, [fetchData, isAuthorized, user?.token]);

  const totalBatches = records.length;
  const qcPassed = records.filter((r) => r.qc_status === "Passed").length;
  const qcFailed = records.filter((r) => r.qc_status === "Failed").length;
  const pendingQc = records.filter((r) => r.qc_status === "Pending").length;

  const stats = [
    {
      title: "Total Batches",
      value: totalBatches,
      icon: IconBuildingFactory,
      color: "blue",
    },
    { title: "QC Passed", value: qcPassed, icon: IconChecklist, color: "teal" },
    { title: "QC Failed", value: qcFailed, icon: IconX, color: "red" },
    { title: "Pending QC", value: pendingQc, icon: IconClock, color: "orange" },
  ];

  const recentActivities = [...records]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 4)
    .map((record) => {
      let actionText = "";
      if (record.qc_status === "Passed")
        actionText = `passed quality control inspection.`;
      else if (record.qc_status === "Failed")
        actionText = `flagged as Failed during inspection.`;
      else actionText = `registered in the system and awaiting QC.`;

      return {
        id: record.id,
        time: new Date(record.created_at).toLocaleDateString(),
        text: `Batch ${record.batch_id} (${record.product_name}) ${actionText}`,
        status: record.qc_status,
      };
    });

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <IconAlertCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">
          403 - Access Denied
        </h1>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          Your current role (<strong>{currentUserRole}</strong>) does not have
          permission to access the Production Module.
        </p>
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
        <title>Dashboard Overview | PT. XYZ</title>
      </Head>

      <AuthLayout sidebarList={productionList}>
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
                  Production Dashboard
                </Text>
                <Text size="sm" className="opacity-90">
                  Monitor overall production performance, batch status, and
                  quality control metrics in real-time.
                </Text>
              </div>
              <Badge color="white" variant="light" size="lg" radius="sm">
                Role: {currentUserRole}
              </Badge>
            </Group>
          </Paper>

          {/* STATS GRID */}
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

          {/* RECENT ACTIVITY MOCKUP */}
          <Paper radius="md" p="md" withBorder shadow="sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <IconActivity size={20} className="text-teal-600" />
              <Text fw={600} className="text-gray-700">
                Recent Updates
              </Text>
            </div>

            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-3 rounded-md border border-gray-100"
                  >
                    <div>
                      <Text size="sm" fw={500} className="text-gray-800">
                        {activity.text}
                      </Text>
                    </div>
                    <Badge
                      variant="dot"
                      color={
                        activity.status === "Passed"
                          ? "teal"
                          : activity.status === "Failed"
                            ? "red"
                            : "orange"
                      }
                      size="sm"
                      className="mt-2 sm:mt-0"
                    >
                      {activity.time}
                    </Badge>
                  </div>
                ))
              ) : (
                <Text size="sm" color="dimmed" align="center" py="md">
                  No recent activities found.
                </Text>
              )}
            </div>
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}
