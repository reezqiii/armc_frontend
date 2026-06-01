import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import {
  Select,
  Loader,
  Badge,
  Text,
  Paper,
  Group,
  Button,
  Grid,
} from "@mantine/core";
import {
  IconClock,
  IconCheck,
  IconLayoutList,
  IconCalendar,
  IconX,
  IconArrowRight,
  IconChartBar,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";

function timeAgo(date) {
  if (!date) return "-";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const REQUEST_STATUS_MAP = {
  0: { label: "Canceled", bg: "#6c757d", text: "#fff" },
  1: { label: "Pending Dept", bg: "#0dcaf0", text: "#fff" },
  2: { label: "Rejected Dept", bg: "#dc3545", text: "#fff" },
  3: { label: "Pending IT", bg: "#0dcaf0", text: "#fff" },
  4: { label: "Rejected IT", bg: "#dc3545", text: "#fff" },
  5: { label: "Completed", bg: "#28a745", text: "#fff" },
};

const getRequestStatus = (statusCode) =>
  REQUEST_STATUS_MAP[statusCode] ?? {
    label: "Unknown",
    bg: "#6c757d",
    text: "#fff",
  };

export default function Dashboard() {
  const router = useRouter();
  const { API_URL } = useApi();
  const { user } = useUser();

  const [month, setMonth] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    if (!user?.token || !API_URL) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/requests/dashboard/summary`, {
          params: { month: month === "all" ? null : Number(month) + 1, year },
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year, user?.token, API_URL]);

  if (loading && !summary) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader color="teal" />
          <Text size="sm" color="dimmed" mt="sm">
            Loading dashboard...
          </Text>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="py-6 px-4 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <Group gap="xs">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
              <IconChartBar size={22} />
            </div>
            <h1 className="text-lg font-bold text-teal-700 uppercase">
              Dashboard Summary
            </h1>
          </Group>

          <Paper withBorder radius="md" px="xs" py={4} shadow="xs">
            <Group gap={0}>
              <Select
                variant="unstyled"
                data={[
                  { value: "all", label: "All Months" },
                  ...monthNames.map((m, i) => ({
                    value: i.toString(),
                    label: m,
                  })),
                ]}
                value={month}
                onChange={setMonth}
                w={110}
                size="xs"
                styles={{ input: { fontWeight: 700, fontSize: 12 } }}
              />
              <div className="w-px h-4 bg-gray-200 mx-2" />
              <Select
                variant="unstyled"
                data={Array.from({ length: 5 }, (_, i) =>
                  (new Date().getFullYear() - i).toString(),
                )}
                value={year.toString()}
                onChange={(v) => setYear(Number(v))}
                w={70}
                size="xs"
                styles={{ input: { fontWeight: 700, fontSize: 12 } }}
              />
            </Group>
          </Paper>
        </div>

        <Grid mb="lg">
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md" shadow="sm">
              <Text size="xs" color="dimmed" fw={700} transform="uppercase">
                Total
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xl" fw={900}>
                  {summary?.total ?? 0}
                </Text>
                <IconLayoutList size={24} className="text-teal-500" />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md" shadow="sm">
              <Text size="xs" color="dimmed" fw={700} transform="uppercase">
                Pending
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xl" fw={900}>
                  {summary?.pending ?? 0}
                </Text>
                <IconClock size={24} className="text-cyan-500" />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md" shadow="sm">
              <Text size="xs" color="dimmed" fw={700} transform="uppercase">
                Rejected
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xl" fw={900}>
                  {summary?.rejected ?? 0}
                </Text>
                <IconX size={24} className="text-red-500" />
              </Group>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <Paper withBorder p="md" radius="md" shadow="sm">
              <Text size="xs" color="dimmed" fw={700} transform="uppercase">
                Completed
              </Text>
              <Group justify="space-between" mt={4}>
                <Text size="xl" fw={900}>
                  {summary?.completed ?? 0}
                </Text>
                <IconCheck size={24} className="text-green-500" />
              </Group>
            </Paper>
          </Grid.Col>
        </Grid>

        <Paper withBorder radius="md" shadow="sm" p="md">
          <Group justify="space-between" mb="lg" className="border-b pb-3">
            <Group gap="xs">
              <IconClock size={18} className="text-teal-600" />
              <Text fw={700} size="sm" color="teal" transform="uppercase">
                Recent Activity
              </Text>
            </Group>
            <Button
              variant="light"
              size="xs"
              color="teal"
              rightSection={<IconArrowRight size={14} />}
              onClick={() => router.push("/user_request/list/all")}
            >
              View All
            </Button>
          </Group>

          <div className="space-y-4">
            {summary?.recentRequests && summary.recentRequests.length > 0 ? (
              summary.recentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="max-w-[70%]">
                    <Text fw={700} size="sm" color="gray.8">
                      {req.requester}
                    </Text>
                    <Text size="xs" color="dimmed" truncate>
                      {req.subject}
                    </Text>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      size="xs"
                      radius="sm"
                      styles={{
                        root: {
                          backgroundColor: getRequestStatus(req.status).bg,
                          color: getRequestStatus(req.status).text,
                          fontSize: "9px",
                          height: "18px",
                        },
                      }}
                    >
                      {getRequestStatus(req.status).label}
                    </Badge>
                    <Text size="10px" color="gray.4" italic>
                      {timeAgo(req.date)}
                    </Text>
                  </div>
                </div>
              ))
            ) : (
              <Text size="xs" color="dimmed" ta="center" py="xl">
                No recent requests found
              </Text>
            )}
          </div>
        </Paper>
      </div>
    </AuthLayout>
  );
}
