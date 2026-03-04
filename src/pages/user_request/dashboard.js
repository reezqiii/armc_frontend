import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import {
  Select,
  Button,
  Paper,
  Loader,
  SimpleGrid,
  Text,
  Group,
  Box,
  Title,
  rem,
  NumberInput,
  ActionIcon,
  ScrollArea,
} from "@mantine/core";
import {
  IconFilter,
  IconClock,
  IconLoader2,
  IconCircleCheck,
  IconLayoutDashboard,
  IconTrendingUp,
  IconSearch,
} from "@tabler/icons-react";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import { BarChart, DonutChart } from "@mantine/charts";

function Dashboard() {
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const companyStats = summary?.companyStats ?? [];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const ACTION_COLORS = [
    "#3B82F6", // blue
    "#0EA5E9", // sky
    "#10B981", // emerald
    "#6366F1", // indigo
    "#F59E0B", // amber (sedikit aksen)
    "#64748B", // slate
  ];

  useEffect(() => {
    const fetchLatestPeriod = async () => {
      try {
        if (!API_URL) return;
        const res = await axios.get(
          `${API_URL}/requests/dashboard/latest-period`,
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          },
        );
        if (res.data) {
          setMonth(res.data.month - 1);
          setYear(res.data.year);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchLatestPeriod();
  }, [user?.token, API_URL]);

  useEffect(() => {
    if (!user?.token || month === null || year === null || !API_URL) return;
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${API_URL}/requests/dashboard/summary`, {
          params: { month: month + 1, year: year },
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSummary();
  }, [month, year, user?.token, API_URL]);

  if (loading || !user?.token) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
          <Loader size="lg" type="dots" color="blue" />
          <Text fw={500} c="dimmed">
            Preparing analytics...
          </Text>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={requestorList}>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fb",
          padding: "32px",
        }}
      >
        <Paper
          radius="lg"
          p="xl"
          withBorder
          shadow="md"
          mb="xl"
          style={{ background: "#ffffff" }}
        >
          <Group justify="space-between" align="center" wrap="wrap">
            {/* LEFT SIDE */}
            <Group gap="md">
              <Box
                p="sm"
                style={{
                  backgroundColor: "var(--mantine-color-blue-0)",
                  borderRadius: "14px",
                }}
              >
                <IconTrendingUp size={26} color="var(--mantine-color-blue-6)" />
              </Box>

              <Box>
                <Title order={3} fw={600}>
                  Monthly Request Dashboard
                </Title>

                <Text size="sm" c="dimmed" mt={4}>
                  Monitoring performance for{" "}
                  <Text span fw={500} c="blue.6">
                    {month !== null ? `${monthNames[month]} ${year}` : "..."}
                  </Text>
                </Text>
              </Box>
            </Group>

            {/* RIGHT SIDE - COOL FILTER TOOLBAR */}
            <Box
              style={{
                background: "var(--mantine-color-gray-0)",
                padding: "6px",
                borderRadius: "16px",
              }}
            >
              <Group gap="xs">
                <Select
                  data={monthNames.map((m, i) => ({
                    value: i.toString(),
                    label: m,
                  }))}
                  value={month?.toString()}
                  onChange={(val) => setMonth(Number(val))}
                  w={140}
                />

                <Select
                  data={Array.from({ length: 5 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return { value: y.toString(), label: y.toString() };
                  })}
                  value={year?.toString()}
                  onChange={(val) => setYear(Number(val))}
                  w={100}
                />

                <ActionIcon variant="filled" radius="xl" size="lg" color="blue">
                  <IconSearch size={16} />
                </ActionIcon>
              </Group>
            </Box>
          </Group>
        </Paper>

        {/* --- STATS CARDS --- */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          <StatsCard
            title="Total Request"
            value={summary?.total}
            icon={<IconLayoutDashboard size={28} />}
            color="blue"
          />
          <StatsCard
            title="On Queue"
            value={summary?.onQueue}
            icon={<IconClock size={28} />}
            color="orange"
          />
          <StatsCard
            title="On Progress"
            value={summary?.onProgress}
            icon={<IconLoader2 size={28} />}
            color="cyan"
          />
          <StatsCard
            title="Completed"
            value={summary?.completed}
            icon={<IconCircleCheck size={28} />}
            color="green"
          />
        </SimpleGrid>

        {/* CHART DEPARTMENT */}
<Paper
  radius={18}
  p="xl"
  shadow="sm"
  style={{
    background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
    border: "1px solid #eef1f6",
  }}
>
  {/* ... Header tetap sama ... */}

  {/* Area Scroll Horizontal */}
  <ScrollArea w="100%" pb="md">
    <Group wrap="nowrap" gap="md">
      {summary?.deptStats?.map((item) => (
        <Paper
          key={item.name}
          withBorder
          p="md"
          radius="md"
          shadow="xs"
          style={{
            minWidth: 160, // Menentukan lebar kartu agar bisa di-scroll
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Text size="sm" fw={700} c="blue.7" mb={4} style={{ whiteSpace: 'nowrap' }}>
            {item.name}
          </Text>
          <Text size="xl" fw={800}>
            {item.count}
          </Text>
          <Text size="xs" c="dimmed">
            Total
          </Text>
        </Paper>
      ))}
    </Group>
  </ScrollArea>
</Paper>

         {/* CHART COMPANY */}
<Paper
  radius={18}
  p="xl"
  shadow="sm"
  style={{
    background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
    border: "1px solid #eef1f6",
  }}
>
  {/* ... Header tetap sama ... */}

  <ScrollArea w="100%" pb="md">
    <Group wrap="nowrap" gap="md">
      {companyStats?.map((item) => (
        <Paper
          key={item.name}
          withBorder
          p="md"
          radius="md"
          style={{ minWidth: 180, textAlign: "center" }}
        >
          <Text size="sm" fw={700} c="cyan.7" mb={4}>
            {item.name}
          </Text>
          <Text size="xl" fw={800}>
            {item.value}
          </Text>
          <Text size="xs" c="dimmed">
            Total
          </Text>
        </Paper>
      ))}
    </Group>
  </ScrollArea>
</Paper>
</div>
    </AuthLayout>
  );
}

function StatsCard({ title, value, icon, color }) {
  const c = color || "blue";

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      shadow="sm"
      className="group"
      style={{
        transition: "all 0.2s ease",
        borderTop: `${rem(4)} solid var(--mantine-color-${c}-6)`,
        backgroundColor: "#fff",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={rem(1)}>
            {title}
          </Text>
          <Text size="2.2rem" fw={800} mt={rem(4)} style={{ lineHeight: 1 }}>
            {value ?? 0}
          </Text>
        </Box>

        <Box
          p="md"
          style={{
            backgroundColor: `var(--mantine-color-${c}-0)`,
            color: `var(--mantine-color-${c}-6)`,
            borderRadius: rem(12),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease",
          }}
          className="group-hover:scale-110"
        >
          {icon}
        </Box>
      </Group>

      {/* Progress Bar Mini - Lebih Subtle */}
      <Box
        mt="md"
        h={rem(4)}
        radius="xl"
        bg={`var(--mantine-color-${c}-1)`}
        style={{ overflow: "hidden" }}
      >
        <Box
          h="100%"
          bg={`var(--mantine-color-${c}-6)`}
          style={{
            width: value > 0 ? "70%" : "0%",
            transition: "width 1s ease-in-out",
            borderRadius: "inherit",
          }}
        />
      </Box>
    </Paper>
  );
}

export default Dashboard;
