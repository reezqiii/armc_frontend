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
  ActionIcon,
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
  IconPlayerPause,
  IconLayoutGrid,
  IconBuildingCommunity,
  IconChevronRight,
  IconCircleCheck,
  IconFiles,
  IconCheck,
  IconTrendingUp,
  IconLayoutList,
} from "@tabler/icons-react";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";

function Dashboard() {
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [month, setMonth] = useState(null);
  const [year, setYear] = useState(null);
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

  const isSummaryEmpty =
    !summary ||
    ((summary.deptStats?.length === 0 || !summary.deptStats) &&
      (summary.total === 0 || !summary.total) &&
      (summary.companyStats?.length === 0 || !summary.companyStats));

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
          <Text fw={500} c="dimmed">
            Preparing analytics...
          </Text>
        </Flex>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={requestorList}>
      <Box p="xl" bg="#f4f6f8" style={{ minHeight: "100vh" }}>
        {/* --- HEADER --- */}
        <Group justify="space-between" mb="lg">
          <Box>
            <Title order={2} fw={700} lts={-0.5} c="blue" tt="uppercase">
              Monthly Request Dashboard
            </Title>
            <Text size="sm" fw={500} mt={4} style={{ color: "#495057" }}>
              Request summary for{" "}
              <Text span fw={600} style={{ color: "#1c7ed6" }}>
                {monthNames[month]} {year}
              </Text>
            </Text>
          </Box>
          <Paper radius="md" p="4px 12px" withBorder shadow="xs" bg="white">
            <Group gap="xs">
              <Select
                variant="unstyled"
                data={monthNames.map((m, i) => ({
                  value: i.toString(),
                  label: m,
                }))}
                value={month?.toString()}
                onChange={(val) => setMonth(Number(val))}
                w={120}
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

        {/* no found */}
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

              <Text size="sm" c="dimmed" maw={420}>
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
                        borderBottom: `4px solid #228be6`,
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
                      {summary?.companyStats?.length || 0} Companies
                    </Badge>
                  </Group>

                  <ScrollArea h={800} offsetScrollbars scrollbarSize={6}>
                    <Stack gap="xs" pr="md">
                      {summary?.companyStats?.map((comp, index) => (
                        <Paper
                          key={comp.name}
                          p="md"
                          radius="md"
                          withBorder
                          style={{
                            transition: "all 0.2s ease",
                            borderLeft: "4px solid #228be6",
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
                                  background: "#000",
                                }}
                              />
                              <Text fw={700} size="md" c="blue.7">
                                {comp.name}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <Box style={{ textAlign: "center" }}>
                                <Text fw={800} size="xl" c="dark.4">
                                  {comp.value}
                                </Text>
                                <Text
                                  size="md"
                                  c="dimmed"
                                  mt={4}
                                  fw={600}
                                  style={{ marginTop: -4 }}
                                >
                                  Total
                                </Text>
                              </Box>
                            </Group>
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

  const iconAnimation = getIconAnimation();

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
          <motion.div {...iconAnimation}>
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
        style={{
          flex: 1,
          minHeight: "140px",
          backgroundColor: "#ffffff", // Pastikan putih bersih
        }}
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

        <Text c="dimmed" fw={600} size="md" mt="sm">
          Total {label}
        </Text>
      </Stack>
    </Paper>
  );
}

Dashboard.title = "Dashboard";
export default Dashboard;
