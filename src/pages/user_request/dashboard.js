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

// ─── Shared helpers ──────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return "-";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Stat Card (same style as user management) ───────────────────────────────

const StatCard = ({ icon: Icon, label, value, colorClass, sub, animationType }) => {
  const getAnim = () => {
    switch (animationType) {
      case "pulse":
        return { animate: { scale: [1, 1.15, 1] }, transition: { repeat: Infinity, duration: 1.6 } };
      case "spin":
        return { animate: { rotate: 360 }, transition: { repeat: Infinity, duration: 1.5, ease: "linear" } };
      case "bounce":
        return { animate: { y: [0, -2, 0] }, transition: { repeat: Infinity, duration: 2.2 } };
      case "pop":
        return { initial: { scale: 0.7 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 260, damping: 16 } };
      default:
        return {};
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <motion.div {...getAnim()}>
          <Icon size={22} className="text-white" />
        </motion.div>
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value ?? "-"}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

// ─── Tooltip ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-md rounded-xl p-3 min-w-[160px]">
        <p className="text-sm font-semibold text-teal-700 mb-2">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: p.fill }} />
            <span className="text-xs text-gray-400">{p.name}:</span>
            <span className="text-xs font-bold text-gray-700">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

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
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const monthOptions = [
    { value: "all", label: "All Months" },
    ...monthNames.map((m, i) => ({ value: i.toString(), label: m })),
  ];

  const DEPT_COLORS = [
    "#14b8a6","#0d9488","#2dd4bf","#0f766e",
    "#5eead4","#0891b2","#06b6d4","#67e8f9",
  ];

  const DEPT_BG = [
    "bg-teal-500","bg-teal-600","bg-cyan-400","bg-teal-700",
    "bg-teal-300","bg-cyan-600","bg-cyan-500","bg-cyan-300",
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
        <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
          <Loader size="lg" type="dots" color="teal" />
          <p className="text-sm text-gray-400 font-medium">Preparing analytics...</p>
        </div>
      </AuthLayout>
    );
  }

  const periodLabel =
    month === "all"
      ? `All Months · ${year}`
      : `${monthNames[Number(month)]} ${year}`;

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="py-6 px-4 bg-gray-50 min-h-screen">

        {/* ── HEADER ── */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-teal-600 uppercase tracking-wide">
              Request Dashboard
            </h1>
            <div className="flex items-center gap-1 mt-1">
              <IconCalendar size={13} className="text-gray-400" />
              <p className="text-xs text-gray-400">{periodLabel}</p>
            </div>
          </div>

          {/* Period selector — same card style as user management header area */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-sm px-3 py-1.5">
            <Select
              variant="unstyled"
              data={monthOptions}
              value={month?.toString()}
              onChange={(val) => setMonth(val)}
              w={130}
              size="xs"
              styles={{ input: { fontWeight: 600, color: "#374151", fontSize: 13 } }}
            />
            <div className="w-px h-4 bg-gray-200 mx-1" />
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
              styles={{ input: { fontWeight: 600, color: "#374151", fontSize: 13 } }}
            />
          </div>
        </div>

        {isSummaryEmpty ? (
          /* ── EMPTY STATE ── */
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center mt-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
                <IconSearch size={30} className="text-teal-400" strokeWidth={1.5} />
              </div>
              <p className="font-bold text-gray-700 text-base">No Requests Found</p>
              <p className="text-sm text-gray-400 max-w-xs">
                No data for{" "}
                <span className="font-semibold text-gray-600">
                  {month === "all" ? "All Months" : monthNames[Number(month)]} {year}
                </span>
                . Try a different period.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── ROW 1: Stat Cards — same grid as user management ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={IconLayoutList}
                label="All Request"
                value={summary?.total}
                colorClass="bg-teal-500"
                sub="total requests"
                animationType="bounce"
              />
              <StatCard
                icon={IconClock}
                label="On Queue"
                value={summary?.onQueue}
                colorClass="bg-amber-400"
                sub="awaiting action"
                animationType="pulse"
              />
              <StatCard
                icon={IconLoader2}
                label="On Progress"
                value={summary?.onProgress}
                colorClass="bg-cyan-500"
                sub="being processed"
                animationType="spin"
              />
              <StatCard
                icon={IconCheck}
                label="Completed"
                value={summary?.completed ?? 0}
                colorClass="bg-green-500"
                sub="done"
                animationType="pop"
              />
            </div>

            {/* ── ROW 2: Bar Chart (2/3) + Department Carousel (1/3) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

              {/* Bar Chart — 2/3 width, same card style */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                      <IconChartBar size={16} className="text-teal-500" />
                      Queue &amp; Progress by Department
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-teal-500" />
                        <span className="text-xs text-gray-400 font-medium">On Queue</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-teal-200" />
                        <span className="text-xs text-gray-400 font-medium">On Progress</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: 320, overflowX: "hidden" }}
                  >
                    <div style={{ height: Math.max(chartData.length * 44 + 40, 240) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          layout="vertical"
                          margin={{ top: 4, right: 52, left: 8, bottom: 4 }}
                          barCategoryGap="28%"
                          barGap={3}
                        >
                          <CartesianGrid horizontal={false} stroke="#f1f5f9" />
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
                            width={180}
                            tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f0fdfa" }} />
                          <Bar dataKey="onQueue" name="On Queue" fill="#14b8a6" barSize={11} radius={[0, 3, 3, 0]}>
                            <LabelList
                              dataKey="onQueue"
                              position="right"
                              style={{ fontSize: 11, fontWeight: 700, fill: "#475569" }}
                              formatter={(v) => (v > 0 ? v : "")}
                            />
                          </Bar>
                          <Bar dataKey="onProgress" name="On Progress" fill="#99f6e4" barSize={11} radius={[0, 3, 3, 0]}>
                            <LabelList
                              dataKey="onProgress"
                              position="right"
                              style={{ fontSize: 11, fontWeight: 700, fill: "#475569" }}
                              formatter={(v) => (v > 0 ? v : "")}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Department Carousel — 1/3 width, same card style as Quick Access */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                    <IconLayoutGrid size={16} className="text-teal-500" />
                    By Department
                  </h2>
                  <span className="text-xs bg-teal-50 text-teal-600 font-bold px-2 py-0.5 rounded-full border border-teal-100">
                    {summary?.deptStats?.length || 0}
                  </span>
                </div>

                {(() => {
                  const itemsPerPage = 5;
                  const deptStats = summary?.deptStats || [];
                  const totalDeptPages = Math.ceil(deptStats.length / itemsPerPage);
                  const visible = deptStats.slice(
                    deptPage * itemsPerPage,
                    deptPage * itemsPerPage + itemsPerPage
                  );

                  return (
                    <div className="flex flex-col gap-3">
                      {/* Dept list rows — same style as role bar rows in user management */}
                      <div className="space-y-3">
                        {visible.map((item, idx) => {
                          const globalIdx = deptPage * itemsPerPage + idx;
                          const color = DEPT_COLORS[globalIdx % DEPT_COLORS.length];
                          const bg = DEPT_BG[globalIdx % DEPT_BG.length];
                          const max = Math.max(...deptStats.map((d) => d.count ?? 0), 1);
                          const pct = Math.round(((item.count ?? 0) / max) * 100);
                          return (
                            <div key={item.name}>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ background: color }}
                                  />
                                  <span
                                    className="text-sm text-gray-600 font-semibold truncate max-w-[130px]"
                                    title={item.name}
                                  >
                                    {item.name}
                                  </span>
                                </div>
                                <Badge color="teal" variant="light" size="sm">
                                  {item.count ?? 0}
                                </Badge>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full ${bg}`}
                                  style={{ width: `${pct}%`, transition: "width 0.5s ease" }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalDeptPages > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                          <span className="text-xs text-gray-400">
                            Page {deptPage + 1} of {totalDeptPages}
                          </span>
                          <div className="flex gap-1">
                            <button
                              disabled={deptPage === 0}
                              onClick={() => setDeptPage((p) => p - 1)}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <IconChevronLeft size={14} />
                            </button>
                            <button
                              disabled={deptPage >= totalDeptPages - 1}
                              onClick={() => setDeptPage((p) => p + 1)}
                              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <IconChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

Dashboard.title = "Dashboard";
export default Dashboard;