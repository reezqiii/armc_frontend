import React, { useState, useEffect } from "react";
import { getAdminStatus } from "@/lib/adminStatus";
import axios from "axios";
import { motion } from "framer-motion";
import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import {
  Select,
  Paper,
  Loader,
  SimpleGrid,
  Text,
  Group,
  Box,
  Title,
  ScrollArea,
  Flex,
  Stack,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import {
  IconClock,
  IconLoader2,
  IconSearch,
  IconLayoutGrid,
  IconBuildingCommunity,
  IconCheck,
  IconTrendingUp,
  IconLayoutList,
  IconChartBar,
} from "@tabler/icons-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        p="sm"
        withBorder
        shadow="md"
        radius="md"
        bg="white"
        style={{ minWidth: 160 }}
      >
        <Text fw={600} size="sm" c="blue.7" mb={4}>
          {label}
        </Text>
        {payload.map((p) => (
          <Group key={p.name} gap="xs">
            <Box
              w={10}
              h={10}
              style={{ borderRadius: 2, background: p.fill }}
            />
            <Text size="sm" c="dimmed">
              {p.name}:
            </Text>
            <Text size="sm" fw={600}>
              {p.value}
            </Text>
          </Group>
        ))}
      </Paper>
    );
  }
  return null;
};

function Dashboard() {
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [month, setMonth] = useState("all");
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

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

  const monthOptions = [
    { value: "all", label: "All Months" },
    ...monthNames.map((m, i) => ({ value: i.toString(), label: m })),
  ];

  const isSummaryEmpty =
    !summary ||
    ((summary.deptStats?.length === 0 || !summary.deptStats) &&
      (summary.total === 0 || !summary.total) &&
      (summary.companyStats?.length === 0 || !summary.companyStats));

  useEffect(() => {
    const fetchLatestPeriod = async () => {
      try {
        if (!API_URL) return;
        await axios.get(`${API_URL}/requests/dashboard/latest-period`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
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
          params: { month: month === "all" ? null : Number(month) + 1, year },
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setSummary(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSummary();
  }, [month, year, user?.token, API_URL]);

  const chartData = (summary?.deptStats || [])
    .map((d) => ({
      name: d.name,
      onQueue: d.onQueue ?? d.count ?? 0,
      onProgress: d.onProgress ?? 0,
    }))
    .sort((a, b) => b.onQueue + b.onProgress - (a.onQueue + a.onProgress));

  const companyStats = (summary?.companyStats || []).filter(
    (c) => c.name && c.name.trim() !== "" && c.name !== "No Company",
  );

  const chartHeight = Math.max(chartData.length * 44 + 40, 300);

  if (loading) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <Flex
          justify="center"
          align="center"
          h="70vh"
          direction="column"
          gap="md"
        >
          <Loader size="lg" type="dots" color="blue" />
          <Text fw={500} c="dimmed" size="md">
            Preparing analytics...
          </Text>
        </Flex>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={requestorList}>
      <Box p="xl" bg="#f4f6f8" style={{ minHeight: "100vh" }}>
        {/* HEADER */}
        <Group justify="space-between" mb="lg">
          <Box>
            <Title order={2} fw={700} lts={-0.5} c="blue" tt="uppercase">
              Monthly Request Dashboard
            </Title>
            <Text size="md" fw={500} mt={4} style={{ color: "#495057" }}>
              Request summary for{" "}
              <Text span fw={600} style={{ color: "#1c7ed6" }}>
                {month === "all" ? "All Months" : monthNames[Number(month)]}{" "}
                {year}
              </Text>
            </Text>
          </Box>
          <Paper radius="md" p="4px 12px" withBorder shadow="xs" bg="white">
            <Group gap="xs">
              <Select
                variant="unstyled"
                data={monthOptions}
                value={month?.toString()}
                onChange={(val) => setMonth(val)}
                w={140}
                size="sm"
              />
              <Select
                variant="unstyled"
                data={Array.from({ length: 10 }, (_, i) => {
                  const y = new Date().getFullYear() - i;
                  return { value: y.toString(), label: y.toString() };
                })}
                value={year?.toString()}
                onChange={(val) => setYear(Number(val))}
                w={80}
                size="sm"
              />
            </Group>
          </Paper>
        </Group>

        {isSummaryEmpty ? (
          <Paper
            withBorder
            radius="lg"
            p="xl"
            mt="xl"
            style={{
              textAlign: "center",
              backgroundColor: "#f8f9fa",
              borderStyle: "dashed",
              borderWidth: 2,
              borderColor: "#dee2e6",
            }}
          >
            <Stack align="center" gap="sm">
              <ThemeIcon size={70} radius="xl" variant="light" color="blue">
                <IconSearch size={36} stroke={1.8} />
              </ThemeIcon>
              <Title order={4} fw={600}>
                No Requests Found
              </Title>
              <Text size="md" c="dimmed" maw={420}>
                There is currently no request data available for{" "}
                <Text span fw={600} c="dark">
                  {monthNames[month]} {year}
                </Text>
                . Please select another period or check again later.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <>
            {/* BY DEPARTMENT */}
            <Paper
              p="xl"
              mb="xl"
              withBorder
              shadow="sm"
              bg="white"
              style={{ border: "none" }}
            >
              <Group mb="lg" px="xs" justify="space-between">
                <Group gap="sm">
                  <ThemeIcon
                    variant="light"
                    color="blue.6"
                    size="md"
                    radius="md"
                  >
                    <IconLayoutGrid size={18} />
                  </ThemeIcon>
                  <Text fw={700} size="md" c="blue.6" lts={0.5}>
                    BY DEPARTMENT
                  </Text>
                </Group>
                <Badge size="lg" radius="sm" variant="light" color="black">
                  {summary?.deptStats?.length || 0} Departments
                </Badge>
              </Group>

              <ScrollArea pb="md" offsetScrollbars scrollbarSize={6}>
                <Flex gap="lg">
                  {summary?.deptStats?.map((item) => (
                    <Paper
                      key={item.name}
                      withBorder
                      p="lg"
                      radius="lg"
                      style={{
                        minWidth: 220,
                        background: "#fff",
                        borderColor: "#f1f3f5",
                        borderBottom: "4px solid #228be6",
                        transition: "all 0.2s ease",
                        cursor: "default",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "var(--mantine-shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Box mb="md">
                        <Text
                          size="md"
                          fw={700}
                          c="blue.6"
                          tt="uppercase"
                          lts={0.5}
                          style={{
                            lineHeight: 1.2,
                            minHeight: "2.4em",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {item.name}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          size="32px"
                          fw={700}
                          c="dark.4"
                          style={{ lineHeight: 1 }}
                        >
                          {item.count}
                        </Text>
                        <Text size="md" c="dimmed" mt={4} fw={600}>
                          Total
                        </Text>
                      </Box>
                    </Paper>
                  ))}
                </Flex>
              </ScrollArea>
            </Paper>

            {/* ON QUEUE & ON PROGRESS — Horizontal Bar Chart */}
            {chartData.length > 0 && (
              <Paper
                p="xl"
                mb="xl"
                withBorder
                shadow="sm"
                bg="white"
                style={{ border: "none" }}
              >
                <Group mb="lg" px="xs" justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon
                      variant="light"
                      color="blue.6"
                      size="md"
                      radius="md"
                    >
                      <IconChartBar size={18} />
                    </ThemeIcon>
                    <Text fw={700} size="md" c="blue.6" lts={0.5}>
                      ON QUEUE &amp; ON PROGRESS REQUEST
                    </Text>
                  </Group>
                  <Group gap="lg">
                    <Group gap={6}>
                      <Box
                        w={12}
                        h={12}
                        style={{ borderRadius: 2, background: "#185FA5" }}
                      />
                      <Text size="md" c="dimmed" fw={500}>
                        On Queue
                      </Text>
                    </Group>
                    <Group gap={6}>
                      <Box
                        w={12}
                        h={12}
                        style={{ borderRadius: 2, background: "#85B7EB" }}
                      />
                      <Text size="md" c="dimmed" fw={500}>
                        On Progress
                      </Text>
                    </Group>
                  </Group>
                </Group>

                <ScrollArea h={400} offsetScrollbars scrollbarSize={6}>
                  <Box
                    style={{
                      height: Math.max(chartData.length * 44 + 40, 300),
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 4, right: 56, left: 16, bottom: 4 }}
                        barCategoryGap="25%"
                        barGap={3}
                      >
                        <CartesianGrid horizontal={false} stroke="#f1f3f5" />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 13, fill: "#adb5bd" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={200}
                          tick={{
                            fontSize: 13,
                            fill: "#495057",
                            fontWeight: 500,
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: "#f8f9fa" }}
                        />
                        <Bar
                          dataKey="onQueue"
                          name="On Queue"
                          fill="#185FA5"
                          barSize={14}
                          radius={[0, 2, 2, 0]}
                        >
                          <LabelList
                            dataKey="onQueue"
                            position="right"
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              fill: "#495057",
                            }}
                            formatter={(v) => (v > 0 ? v : "")}
                          />
                        </Bar>
                        <Bar
                          dataKey="onProgress"
                          name="On Progress"
                          fill="#85B7EB"
                          barSize={14}
                          radius={[0, 2, 2, 0]}
                        >
                          <LabelList
                            dataKey="onProgress"
                            position="right"
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              fill: "#495057",
                            }}
                            formatter={(v) => (v > 0 ? v : "")}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ScrollArea>
              </Paper>
            )}

            {/* STATUS + BY COMPANY */}
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
              <Paper
                p="xl"
                withBorder
                shadow="sm"
                bg="white"
                style={{ border: "none" }}
              >
                <Group mb="lg" px="xs" justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon
                      variant="light"
                      color="blue.6"
                      size="md"
                      radius="md"
                    >
                      <IconTrendingUp size={18} />
                    </ThemeIcon>
                    <Text
                      fw={700}
                      size="md"
                      c="blue.6"
                      lts={0.5}
                      tt="uppercase"
                    >
                      STATUS REQUEST
                    </Text>
                  </Group>
                </Group>
                <Stack gap="lg">
                  <StatusCard
                    label="All Request"
                    value={summary?.total}
                    color="gray"
                    icon={<IconLayoutList />}
                  />
                  <StatusCard
                    label="On Queue"
                    value={summary?.onQueue}
                    statusCode={0}
                    icon={<IconClock />}
                  />
                  <StatusCard
                    label="On Progress"
                    value={summary?.onProgress}
                    statusCode={1}
                    icon={<IconLoader2 />}
                  />
                  <StatusCard
                    label="Completed"
                    value={summary?.completed ?? 0}
                    statusCode={2}
                    icon={<IconCheck />}
                  />
                </Stack>
              </Paper>

              <Box style={{ gridColumn: "span 2" }}>
                <Paper
                  p="xl"
                  withBorder
                  shadow="sm"
                  h="100%"
                  bg="white"
                  style={{ border: "none", overflow: "hidden" }}
                >
                  <Group mb="lg" px="xs" justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon
                        variant="light"
                        color="blue.6"
                        size="md"
                        radius="md"
                      >
                        <IconBuildingCommunity size={18} />
                      </ThemeIcon>
                      <Text
                        fw={700}
                        size="md"
                        c="blue.6"
                        lts={0.5}
                        tt="uppercase"
                      >
                        BY COMPANY
                      </Text>
                    </Group>
                    <Badge size="lg" radius="sm" variant="light" color="black">
                      {companyStats.length} Companies
                    </Badge>
                  </Group>

                  <ScrollArea h={800} offsetScrollbars scrollbarSize={6}>
                    <Stack gap="xs" pr="md">
                      {companyStats.map((comp, index) => (
                        <Paper
                          key={comp.name}
                          p="md"
                          radius="md"
                          withBorder
                          style={{
                            transition: "all 0.2s ease",
                            borderLeft: "4px solid #228be6",
                            borderRadius: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateX(8px)";
                            e.currentTarget.style.backgroundColor = "#e7f5ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateX(0)";
                            e.currentTarget.style.backgroundColor =
                              index % 2 === 0 ? "#f8f9fa" : "#fff";
                          }}
                        >
                          <Group justify="space-between">
                            <Group>
                              <Box
                                w={8}
                                h={8}
                                style={{
                                  borderRadius: "50%",
                                  background: "#228be6",
                                }}
                              />
                              <Text fw={700} size="md" c="blue.7">
                                {comp.name}
                              </Text>
                            </Group>
                            <Box style={{ textAlign: "center" }}>
                              <Text fw={700} size="xl" c="dark.4">
                                {comp.value}
                              </Text>
                              <Text size="md" c="dimmed" mt={4} fw={600}>
                                Total
                              </Text>
                            </Box>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </ScrollArea>
                </Paper>
              </Box>
            </SimpleGrid>
          </>
        )}
      </Box>
    </AuthLayout>
  );
}

function StatusCard({ label, value, statusCode, color, icon }) {
  const statusInfo =
    statusCode !== undefined
      ? getAdminStatus(statusCode)
      : { bg: color || "#34495e", text: "#fff" };

  const getIconAnimation = () => {
    switch (label) {
      case "On Queue":
        return {
          animate: { scale: [1, 1.15, 1] },
          transition: { repeat: Infinity, duration: 1.5 },
        };
      case "On Progress":
        return {
          animate: { rotate: 360 },
          transition: { repeat: Infinity, duration: 1.5, ease: "linear" },
        };
      case "Completed":
        return {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { type: "spring", stiffness: 200 },
        };
      case "All Request":
        return {
          animate: { y: [0, -3, 0] },
          transition: { repeat: Infinity, duration: 2 },
        };
      default:
        return {};
    }
  };

  return (
    <Paper
      withBorder
      radius="md"
      shadow="sm"
      style={{
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "none",
      }}
    >
      <Box
        bg={statusInfo.bg}
        p="xs"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
        {icon && React.isValidElement(icon) && (
          <motion.div {...getIconAnimation()}>
            {React.cloneElement(icon, {
              color: statusInfo.text,
              size: 18,
              stroke: 2.5,
            })}
          </motion.div>
        )}
        <Text c={statusInfo.text} fw={700} size="sm" tt="uppercase" lts={0.5}>
          {label}
        </Text>
      </Box>
      <Stack
        align="center"
        justify="center"
        p="xl"
        gap={0}
        style={{ flex: 1, minHeight: "140px", backgroundColor: "#ffffff" }}
      >
        <Text
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            lineHeight: 1,
            color: "#2C2E33",
          }}
        >
          {value ?? 0}
        </Text>
        <Text c="dimmed" fw={500} size="md" mt="sm">
          Total {label}
        </Text>
      </Stack>
    </Paper>
  );
}

Dashboard.title = "Dashboard";
export default Dashboard;
