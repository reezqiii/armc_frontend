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
  ActionIcon,
  Divider,
} from "@mantine/core";
import {
  IconClock,
  IconLoader2,
  IconSearch,
  IconLayoutGrid,
  IconCheck,
  IconLayoutList,
  IconChartBar,
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
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

// ─── Teal palette ────────────────────────────────────────────────────────────
const T = {
  900: "#0d4f47",
  700: "#0f766e",
  600: "#0d9488",
  500: "#14b8a6",
  400: "#2dd4bf",
  300: "#5eead4",
  100: "#ccfbf1",
  50: "#f0fdfa",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        p="sm"
        shadow="md"
        radius="md"
        bg="white"
        style={{ minWidth: 160, border: `1px solid ${T[100]}` }}
      >
        <Text fw={600} size="sm" style={{ color: T[700] }} mb={6}>
          {label}
        </Text>
        {payload.map((p) => (
          <Group key={p.name} gap="xs" mb={2}>
            <Box
              w={8}
              h={8}
              style={{ borderRadius: 2, background: p.fill, flexShrink: 0 }}
            />
            <Text size="xs" c="dimmed">
              {p.name}:
            </Text>
            <Text size="xs" fw={700} c="dark">
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
  const [deptPage, setDeptPage] = useState(0);

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

  // Dept color palette — teal-adjacent palette
  const DEPT_COLORS = [
    "#14b8a6",
    "#0d9488",
    "#2dd4bf",
    "#0f766e",
    "#5eead4",
    "#0891b2",
    "#06b6d4",
    "#67e8f9",
  ];

  const isSummaryEmpty =
    !summary || summary.deptStats?.length === 0 || !summary.deptStats;

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
          <Loader size="lg" type="dots" color="teal" />
          <Text fw={500} c="dimmed" size="sm">
            Preparing analytics...
          </Text>
        </Flex>
      </AuthLayout>
    );
  }

  const periodLabel =
    month === "all"
      ? `All Months · ${year}`
      : `${monthNames[Number(month)]} ${year}`;

  return (
    <AuthLayout sidebarList={requestorList}>
      <Box
        style={{
          minHeight: "100vh",
          background: "#f0fdf9",
          padding: "16px",
        }}
      >
        {/* ── HEADER ── */}
        <Paper
          radius="xl"
          mb="md"
          style={{
            background: "white",
            border: `1px solid ${T[100]}`,
            overflow: "hidden",
          }}
        >
          {/* Teal accent stripe */}
          <Box
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${T[700]}, ${T[500]}, ${T[300]})`,
            }}
          />
          <Group
            justify="space-between"
            align="center"
            px="xl"
            py="md"
            wrap="wrap"
            gap="sm"
          >
            <Box>
              <Group gap={6} mb={2}>
                <Box
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: T[500],
                  }}
                />
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  lts={1}
                  style={{ color: T[500] }}
                >
                  Analytics
                </Text>
              </Group>
              <Title
                order={3}
                fw={800}
                c="#0f172a"
                style={{ letterSpacing: -0.5 }}
              >
                Request Dashboard
              </Title>
              <Group gap={5} mt={2}>
                <IconCalendar size={12} color="#94a3b8" />
                <Text size="xs" c="dimmed" fw={500}>
                  {periodLabel}
                </Text>
              </Group>
            </Box>

            {/* Period selector */}
            <Paper
              radius="lg"
              px="sm"
              py={6}
              style={{ border: `1px solid ${T[100]}`, background: T[50] }}
            >
              <Group gap={0} align="center">
                <Select
                  variant="unstyled"
                  data={monthOptions}
                  value={month?.toString()}
                  onChange={(val) => setMonth(val)}
                  w={130}
                  size="xs"
                  styles={{
                    input: { fontWeight: 600, color: "#374151", fontSize: 13 },
                  }}
                />
                <Divider orientation="vertical" mx={4} color={T[100]} />
                <Select
                  variant="unstyled"
                  data={Array.from({ length: 10 }, (_, i) => {
                    const y = new Date().getFullYear() - i;
                    return { value: y.toString(), label: y.toString() };
                  })}
                  value={year?.toString()}
                  onChange={(val) => setYear(Number(val))}
                  w={72}
                  size="xs"
                  styles={{
                    input: { fontWeight: 600, color: "#374151", fontSize: 13 },
                  }}
                />
              </Group>
            </Paper>
          </Group>
        </Paper>

        {isSummaryEmpty ? (
          <Paper
            radius="xl"
            p="xl"
            mt="md"
            style={{
              textAlign: "center",
              background: "white",
              border: `2px dashed ${T[100]}`,
            }}
          >
            <Stack align="center" gap="sm" py="xl">
              <ThemeIcon size={64} radius="xl" variant="light" color="teal">
                <IconSearch size={30} stroke={1.5} />
              </ThemeIcon>
              <Title order={4} fw={700} c="#0f172a">
                No Requests Found
              </Title>
              <Text size="sm" c="dimmed" maw={380}>
                No data for{" "}
                <Text span fw={600} c="dark">
                  {month === "all" ? "All Months" : monthNames[Number(month)]}{" "}
                  {year}
                </Text>
                . Try a different period.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="md">
            {/* ── ROW 1: Status Cards — 2 cols mobile / 4 cols desktop ── */}
            <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md">
              <StatusCard
                label="All Request"
                value={summary?.total}
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
            </SimpleGrid>

            {/* ── ROW 2: Department Carousel ── */}
            <Paper
              radius="xl"
              p="lg"
              style={{ background: "white", border: `1px solid ${T[100]}` }}
            >
              <Group mb="md" justify="space-between" wrap="wrap" gap="xs">
                <Group gap="xs">
                  <ThemeIcon size={28} radius="md" color="teal" variant="light">
                    <IconLayoutGrid size={15} />
                  </ThemeIcon>
                  <Box>
                    <Text fw={700} size="sm" c="#0f172a">
                      By Department
                    </Text>
                    <Text size="xs" c="dimmed">
                      Request count per department
                    </Text>
                  </Box>
                </Group>
                <Badge
                  size="sm"
                  radius="xl"
                  fw={600}
                  style={{ background: T[100], color: T[700], border: "none" }}
                >
                  {summary?.deptStats?.length || 0} dept
                </Badge>
              </Group>

              {(() => {
                const itemsPerPage = 7;
                const deptStats = summary?.deptStats || [];
                const totalDeptPages = Math.ceil(
                  deptStats.length / itemsPerPage,
                );
                const visible = deptStats.slice(
                  deptPage * itemsPerPage,
                  deptPage * itemsPerPage + itemsPerPage,
                );

                return (
                  <Group align="stretch" gap="xs" wrap="nowrap">
                    <ActionIcon
                      variant="subtle"
                      color="teal"
                      radius="xl"
                      size="lg"
                      disabled={deptPage === 0}
                      onClick={() => setDeptPage((p) => p - 1)}
                    >
                      <IconChevronLeft size={16} />
                    </ActionIcon>

                    <Flex gap="sm" style={{ flex: 1, overflow: "hidden" }}>
                      {visible.map((item, idx) => {
                        const color =
                          DEPT_COLORS[
                            (deptPage * itemsPerPage + idx) % DEPT_COLORS.length
                          ];
                        return (
                          <Paper
                            key={item.name}
                            p="md"
                            radius="lg"
                            style={{
                              width: `calc((100% - ${(itemsPerPage - 1) * 8}px) / ${itemsPerPage})`,
                              flexShrink: 0,
                              background: T[50],
                              border: `1px solid ${T[100]}`,
                              borderTop: `3px solid ${color}`,
                              transition: "all 0.18s ease",
                              cursor: "default",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              textAlign: "center",
                              gap: 4,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-3px)";
                              e.currentTarget.style.boxShadow = `0 8px 24px ${color}33`;
                              e.currentTarget.style.background = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.background = T[50];
                            }}
                          >
                            <Box
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: color,
                                marginBottom: 2,
                              }}
                            />
                            <Text
                              size="10px"
                              fw={700}
                              tt="uppercase"
                              lts={0.3}
                              style={{
                                color,
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
                            <Text
                              fw={800}
                              c="#0f172a"
                              style={{ fontSize: "1.5rem", lineHeight: 1 }}
                            >
                              {item.count}
                            </Text>
                            <Text size="10px" c="dimmed" fw={500}>
                              total
                            </Text>
                          </Paper>
                        );
                      })}
                    </Flex>

                    <ActionIcon
                      variant="subtle"
                      color="teal"
                      radius="xl"
                      size="lg"
                      disabled={deptPage >= totalDeptPages - 1}
                      onClick={() => setDeptPage((p) => p + 1)}
                    >
                      <IconChevronRight size={16} />
                    </ActionIcon>
                  </Group>
                );
              })()}
            </Paper>

            {/* ── ROW 3: Bar Chart ── */}
            {chartData.length > 0 && (
              <Paper
                radius="xl"
                p="lg"
                style={{ background: "white", border: `1px solid ${T[100]}` }}
              >
                <Group
                  mb="md"
                  justify="space-between"
                  align="flex-start"
                  wrap="wrap"
                  gap="xs"
                >
                  <Group gap="xs">
                    <ThemeIcon
                      size={28}
                      radius="md"
                      color="teal"
                      variant="light"
                    >
                      <IconChartBar size={15} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="sm" c="#0f172a">
                        Queue &amp; Progress
                      </Text>
                      <Text size="xs" c="dimmed">
                        Active requests by department
                      </Text>
                    </Box>
                  </Group>
                  <Group gap="md">
                    <Group gap={5}>
                      <Box
                        w={10}
                        h={10}
                        style={{
                          borderRadius: 3,
                          background: T[600],
                          flexShrink: 0,
                        }}
                      />
                      <Text size="xs" c="dimmed" fw={500}>
                        On Queue
                      </Text>
                    </Group>
                    <Group gap={5}>
                      <Box
                        w={10}
                        h={10}
                        style={{
                          borderRadius: 3,
                          background: T[300],
                          flexShrink: 0,
                        }}
                      />
                      <Text size="xs" c="dimmed" fw={500}>
                        On Progress
                      </Text>
                    </Group>
                  </Group>
                </Group>

                <ScrollArea
                  h={Math.min(chartData.length * 44 + 60, 360)}
                  offsetScrollbars
                  scrollbarSize={4}
                >
                  <Box
                    style={{
                      height: Math.max(chartData.length * 44 + 40, 240),
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 4, right: 56, left: 8, bottom: 4 }}
                        barCategoryGap="28%"
                        barGap={3}
                      >
                        <CartesianGrid horizontal={false} stroke={T[50]} />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={185}
                          tick={{
                            fontSize: 12,
                            fill: "#475569",
                            fontWeight: 500,
                          }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={<CustomTooltip />}
                          cursor={{ fill: T[50] }}
                        />
                        <Bar
                          dataKey="onQueue"
                          name="On Queue"
                          fill={T[600]}
                          barSize={11}
                          radius={[0, 3, 3, 0]}
                        >
                          <LabelList
                            dataKey="onQueue"
                            position="right"
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              fill: "#475569",
                            }}
                            formatter={(v) => (v > 0 ? v : "")}
                          />
                        </Bar>
                        <Bar
                          dataKey="onProgress"
                          name="On Progress"
                          fill={T[300]}
                          barSize={11}
                          radius={[0, 3, 3, 0]}
                        >
                          <LabelList
                            dataKey="onProgress"
                            position="right"
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              fill: "#475569",
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
          </Stack>
        )}
      </Box>
    </AuthLayout>
  );
}

// ─── Status Card ──────────────────────────────────────────────────────────────
function StatusCard({ label, value, statusCode, color, icon }) {
  const STATUS_META = {
    "All Request": {
      bar: T[600],
      lightBg: T[50],
      iconColor: T[600],
      accent: T[700],
      desc: "Total Requests",
    },
    "On Queue": {
      bar: "#f59f00",
      lightBg: "#fffbeb",
      iconColor: "#f59f00",
      accent: "#b45309",
      desc: "Awaiting Action",
    },
    "On Progress": {
      bar: T[400],
      lightBg: T[50],
      iconColor: T[500],
      accent: T[700],
      desc: "Being Processed",
    },
    Completed: {
      bar: "#22c55e",
      lightBg: "#f0fdf4",
      iconColor: "#22c55e",
      accent: "#15803d",
      desc: "Done",
    },
  };

  const meta = STATUS_META[label] ?? {
    bar: color || T[600],
    lightBg: T[50],
    iconColor: T[600],
    accent: T[700],
    desc: label,
  };

  const getIconAnimation = () => {
    switch (label) {
      case "On Queue":
        return {
          animate: { scale: [1, 1.18, 1] },
          transition: { repeat: Infinity, duration: 1.6 },
        };
      case "On Progress":
        return {
          animate: { rotate: 360 },
          transition: { repeat: Infinity, duration: 1.5, ease: "linear" },
        };
      case "Completed":
        return {
          initial: { scale: 0.7, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          transition: { type: "spring", stiffness: 260, damping: 16 },
        };
      case "All Request":
        return {
          animate: { y: [0, -2, 0] },
          transition: { repeat: Infinity, duration: 2.2 },
        };
      default:
        return {};
    }
  };

  return (
    <Paper
      radius="xl"
      style={{
        overflow: "hidden",
        border: `1px solid ${T[100]}`,
        background: "white",
      }}
    >
      {/* Accent bar */}
      <Box style={{ height: 3, background: meta.bar }} />

      <Box p="md">
        {/* Icon + badge row */}
        <Group justify="space-between" align="center" mb="sm">
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: meta.lightBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon && React.isValidElement(icon) && (
              <motion.div {...getIconAnimation()}>
                {React.cloneElement(icon, {
                  color: meta.iconColor,
                  size: 18,
                  stroke: 2.2,
                })}
              </motion.div>
            )}
          </Box>
          <Badge
            size="xs"
            radius="xl"
            style={{
              background: meta.lightBg,
              color: meta.accent,
              fontWeight: 700,
              border: "none",
              fontSize: 10,
              maxWidth: "60%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Badge>
        </Group>

        {/* Big number */}
        <Text
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            lineHeight: 1,
            color: "#0f172a",
            letterSpacing: -1,
          }}
        >
          {value ?? 0}
        </Text>

        {/* Description */}
        <Text size="xs" c="dimmed" mt={4} fw={500}>
          {meta.desc}
        </Text>
      </Box>
    </Paper>
  );
}

Dashboard.title = "Dashboard";
export default Dashboard;
