import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import userList from "@/data/sidebar/UserList";
import {
  IconUsers,
  IconUserCheck,
  IconUserOff,
  IconShield,
  IconBuilding,
  IconFolder,
  IconKey,
  IconPlus,
  IconClock,
} from "@tabler/icons-react";
import { Badge, Paper, RingProgress, Text } from "@mantine/core";

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div
    className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-800">{value ?? "-"}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const QuickBtn = ({ icon: Icon, label, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-all hover:shadow-md ${color}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

function timeAgo(date) {
  if (!date) return "-";
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const COLORS = [
  "bg-teal-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-emerald-500",
];

export default function UserManagementDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const API_URL = useApi().API_URL;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/stats`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.token, API_URL]);

  const activePercent = stats
    ? Math.round((stats.active / stats.total) * 100)
    : 0;

  return (
    <>
      <Head>
        <title>Dashboard | User Management</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="py-6 px-4 bg-gray-50 min-h-screen">
          <div className="mb-6">
            <h1 className="text-xl font-extrabold text-teal-600 uppercase tracking-wide">
              User Management
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Overview of users, roles, and access control
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={IconUsers}
              label="Total Users"
              value={stats?.active}
              color="bg-teal-500"
              sub="active accounts"
            />
            <StatCard
              icon={IconShield}
              label="Roles"
              value={stats?.totalRoles}
              color="bg-blue-500"
            />
            <StatCard
              icon={IconBuilding}
              label="Departments"
              value={stats?.totalDept}
              color="bg-violet-500"
            />
            <StatCard
              icon={IconFolder}
              label="Projects"
              value={stats?.totalProject}
              color="bg-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 lg:col-span-2">
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
                Users per Role
              </h2>
              {loading ? (
                <div className="text-center text-gray-300 text-sm py-8">
                  Loading...
                </div>
              ) : stats?.userPerRole?.length > 0 ? (
                <div className="space-y-4">
                  {stats.userPerRole.map((item, i) => {
                    const max = Math.max(
                      ...stats.userPerRole.map((r) => Number(r.total)),
                    );
                    const pct = Math.round((Number(item.total) / max) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 font-semibold">
                            {item.role_name ?? "No Role"}
                          </span>
                          <Badge color="teal" variant="light" size="sm">
                            {item.total} users
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${COLORS[i % COLORS.length]}`}
                            style={{
                              width: `${pct}%`,
                              transition: "width 0.5s ease",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-300 text-sm py-8">
                  No data
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
                Quick Access
              </h2>
              <div className="flex flex-col gap-3">
                <QuickBtn
                  icon={IconPlus}
                  label="Add User"
                  color="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100"
                  onClick={() =>
                    router.push("/user_management/user_list/add_user")
                  }
                />
                <QuickBtn
                  icon={IconShield}
                  label="Add Role"
                  color="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  onClick={() => router.push("/user_management/role/add_role")}
                />
                <QuickBtn
                  icon={IconBuilding}
                  label="Add Department"
                  color="bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                  onClick={() =>
                    router.push("/user_management/department/add_department")
                  }
                />
                <QuickBtn
                  icon={IconFolder}
                  label="Add Project"
                  color="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  onClick={() =>
                    router.push("/user_management/project/add_project")
                  }
                />
                <QuickBtn
                  icon={IconUserCheck}
                  label="Add Position"
                  color="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  onClick={() =>
                    router.push("/user_management/position/add_position")
                  }
                />
                <QuickBtn
                  icon={IconKey}
                  label="Permissions"
                  color="bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                  onClick={() =>
                    router.push("/user_management/permission/add_permission")
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4 flex items-center gap-2">
              <IconKey size={16} className="text-teal-500" />
              Recent Password Reset
            </h2>
            {loading ? (
              <div className="text-center text-gray-300 text-sm py-4">
                Loading...
              </div>
            ) : stats?.recentReset?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.recentReset.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 leading-tight">
                          {u.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{u.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 ml-2 flex-shrink-0">
                      <IconClock size={12} />
                      {timeAgo(u.last_update_password)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-300 text-sm py-4">
                No recent resets
              </div>
            )}
          </div>
        </div>
      </AuthLayout>
    </>
  );
}
