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
} from "@mantine/core";
import {
  IconTools,
  IconClock,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";

import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import engineeringList from "@/data/sidebar/EngineeringList";

export default function EngineeringDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { API_URL } = useApi();

  const [isAuthorized, setIsAuthorized] = useState(true);
  const [records, setRecords] = useState([]);
  const currentUserRole = user?.role_name || "Unknown Role";

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/engineering`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (Array.isArray(response.data)) {
        setRecords(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setRecords(response.data.data);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      setRecords([]);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (isAuthorized && user?.token) fetchData();
  }, [fetchData, isAuthorized, user?.token]);

  const safeRecords = Array.isArray(records) ? records : [];

  const totalWO = safeRecords.length;
  const pendingWO = safeRecords.filter((r) => r.status === "Pending").length;
  const progressWO = safeRecords.filter(
    (r) => r.status === "In Progress",
  ).length;
  const completedWO = safeRecords.filter(
    (r) => r.status === "Completed",
  ).length;

  const stats = [
    {
      title: "Total Work Orders",
      value: totalWO,
      icon: IconTools,
      color: "teal",
    },
    {
      title: "Pending",
      value: pendingWO,
      icon: IconAlertTriangle,
      color: "red",
    },
    {
      title: "In Progress",
      value: progressWO,
      icon: IconClock,
      color: "orange",
    },
    {
      title: "Completed",
      value: completedWO,
      icon: IconCircleCheck,
      color: "teal",
    },
  ];

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
            <Group justify="space-between" align="center">
              <div>
                <Text size="xl" fw={700} className="mb-1">
                  Engineering Dashboard
                </Text>
                <Text size="sm" className="opacity-90">
                  Monitor maintenance requests and equipment work orders.
                </Text>
              </div>
              <Badge color="white" variant="light" size="lg" radius="sm">
                <Text color="teal" fw={700}>
                  Role: {currentUserRole}
                </Text>
              </Badge>
            </Group>
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
        </div>
      </AuthLayout>
    </>
  );
}
