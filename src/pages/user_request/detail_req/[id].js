import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import { Button, Paper, Loader } from "@mantine/core";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import usePermission from "@/hooks/usePermission";
import { formatDate } from "@/lib/dateFormat";
import { getRequestStatus } from "@/lib/requestStatusList";

function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();
  const { can } = usePermission();
  const { showAlert, showConfirm, showInput, showLoading, closeSwal } =
    useSwal();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- LOGIKA PERMISSION ---
  const isHOD = can("request.approve_hod");
  const isIT = can("request.approve_it");

  const canApproveHOD =
    data?.request_status === 1 &&
    isHOD &&
    data?.approval_hod_by?.id === user?.id;

  const canApproveIT = data?.request_status === 3 && isIT;
  // -------------------------

  const fetchData = useCallback(async () => {
    if (!id || !user?.token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(res.data)) return prev;
        return res.data;
      });
    } catch (err) {
      console.error("Failed to fetch detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.token, API_URL]);

  useEffect(() => {
    if (id && user?.token) fetchData();
  }, [fetchData, id, user?.token]);

  // --- FUNGSI APPROVE / REJECT ---
  const handleProcess = async (action) => {
    let remarks = "";

    if (action === "reject") {
      const result = await showInput(
        "Reject Request",
        "Please provide a reason for rejection",
        "Type your reason here...",
        "Reject",
      );

      if (!result.isConfirmed) return;
      remarks = result.value;
    } else {
      const result = await showConfirm(
        "Approve Request?",
        "Are you sure you want to approve this access request?",
        "Yes, Approve!",
      );

      if (!result.isConfirmed) return;
    }

    try {
      showLoading("Processing...");

      // NOTE: Sesuaikan URL endpoint ini dengan API backend NestJS kamu
      const endpoint =
        action === "approve"
          ? `/requests/approve/${id}`
          : `/requests/reject/${id}`;

      await axios.put(
        `${API_URL}${endpoint}`,
        { remarks }, // Kirim remarks jika reject
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      closeSwal();
      showAlert(
        "Success!",
        "success",
        `Request successfully ${action}ed.`,
        "OK",
      );

      // Kembali ke halaman sebelumnya setelah berhasil
      router.back();
    } catch (err) {
      console.error(err);
      closeSwal();
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || `Failed to ${action} request.`,
        "OK",
      );
    }
  };
  // -------------------------------

  if (loading) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      </AuthLayout>
    );
  }

  if (!data) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="text-center py-10">No data found</div>
      </AuthLayout>
    );
  }

  const status = getRequestStatus(data.request_status);

  const getInitials = (name) =>
    (name || "-")
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white p-0 w-full overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-teal-600 uppercase tracking-tight">
              Portal Access Request Form
              {data?.id_request &&
                ` REQ-${String(data.id_request).padStart(6, "0")}`}
            </h1>
          </div>

          <div className="p-6 md:p-10 space-y-10">
            {/* 1. Date & Requestor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 text-sm">
                  Request Date
                </label>
                <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                  {formatDate(data.created_date)}
                  <IconCalendar size={18} className="text-gray-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 text-sm">
                  Requestor
                </label>
                <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                  {data?.created_by_name || "-"}
                </div>
              </div>
            </div>

            {/* 2. Employee Description */}
            <div className="space-y-6">
              <div className="-mx-6 md:-mx-10 bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                Employee Description
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Category Account
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.category_account_name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Badge ID
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.badge_no || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Full Name
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.full_name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Position
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.position_name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Department
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.department_name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Project
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.project_name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Application Access
                  </label>
                  <div className="min-h-[40px] px-3 py-2 bg-gray-50 border border-gray-300 rounded-md flex flex-wrap items-center gap-1.5">
                    {data.access_nav_menu?.length ? (
                      data.access_nav_menu.map((n, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 border border-teal-100 text-teal-700 text-xs font-medium"
                        >
                          {n.application_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-600">-</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Email Address
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.email || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Purpose of Access Request */}
            <div className="space-y-4">
              <div className="-mx-6 md:-mx-10 bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                Purpose of Access Request
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-sm">
                  Purpose of Request
                </label>
                <div className="min-h-[80px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600 leading-relaxed">
                  {data.request_reason || "-"}
                </div>
              </div>
            </div>

            {/* 4. Approval History */}
            <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-teal-600 px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest border-b border-teal-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>Requestor</div>
                  <div>Dept Head Approval</div>
                  <div>IT Head Approval</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                {/* Col 1 — Requestor */}
                <div className="p-5 flex flex-col justify-between min-h-[120px]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Requested By
                  </span>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-semibold text-teal-700 flex-shrink-0">
                      {getInitials(data?.created_by_name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-tight border-b border-gray-100 pb-1">
                        {data?.created_by_name || "-"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(data?.created_date, { showTime: true })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Col 2 — HOD */}
                <div className="p-5 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Acknowledge By
                    </span>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-semibold text-teal-700 flex-shrink-0">
                        {getInitials(data?.approval_hod_by?.full_name)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-teal-600 leading-tight border-b border-gray-100 pb-1">
                          {data?.approval_hod_by?.full_name || "-"}
                        </p>
                        {data?.approval_hod_date_at ? (
                          <p className="text-xs text-teal-500 mt-0.5">
                            {formatDate(data.approval_hod_date_at, {
                              showTime: true,
                            })}
                          </p>
                        ) : (
                          <p className="text-xs text-amber-500 mt-0.5 flex items-center gap-1">
                            <IconClock size={12} /> Pending approval
                          </p>
                        )}
                      </div>
                    </div>
                    {data?.rejected_hod_remarks && (
                      <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-md">
                        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">
                          Rejection Reason
                        </p>
                        <p className="text-xs text-red-700">
                          {data.rejected_hod_remarks}
                        </p>
                      </div>
                    )}
                  </div>

                  {canApproveHOD && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Button
                        color="green"
                        size="xs"
                        className="flex-1"
                        onClick={() => handleProcess("approve")}
                        leftSection={<IconCheck size={14} />}
                      >
                        Approve
                      </Button>
                      <Button
                        color="red"
                        size="xs"
                        className="flex-1"
                        onClick={() => handleProcess("reject")}
                        leftSection={<IconX size={14} />}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>

                {/* Col 3 — HOD IT */}
                <div className="p-5 bg-gray-50/30 flex flex-col justify-between min-h-[120px]">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Approved By
                    </span>
                    {data?.approval_it_hod_by?.full_name ? (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-semibold text-teal-700 flex-shrink-0">
                          {getInitials(data.approval_it_hod_by.full_name)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-teal-600 leading-tight border-b border-gray-100 pb-1">
                            {data.approval_it_hod_by.full_name}
                          </p>
                          <p className="text-xs text-teal-500 mt-0.5">
                            {data.approval_it_date_at
                              ? formatDate(data.approval_it_date_at, {
                                  showTime: true,
                                })
                              : "-"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="1.5"
                          >
                            <circle cx="12" cy="8" r="4" />
                            <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-400 italic border-b border-dashed border-gray-200 pb-1">
                            Waiting HOD IT Approval...
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <IconClock size={12} /> Waiting approval...
                          </p>
                        </div>
                      </div>
                    )}
                    {data?.rejected_it_remarks && (
                      <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 rounded-md">
                        <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">
                          Rejection Reason
                        </p>
                        <p className="text-xs text-red-700">
                          {data.rejected_it_remarks}
                        </p>
                      </div>
                    )}
                  </div>

                  {canApproveIT && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                      <Button
                        color="green"
                        size="xs"
                        className="flex-1"
                        onClick={() => handleProcess("approve")}
                        leftSection={<IconCheck size={14} />}
                      >
                        Approve
                      </Button>
                      <Button
                        color="red"
                        size="xs"
                        className="flex-1"
                        onClick={() => handleProcess("reject")}
                        leftSection={<IconX size={14} />}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons (Footer) */}
            <div className="flex justify-between items-center pt-2">
              <Button
                leftSection={<IconArrowLeft size={18} />}
                color="gray"
                size="sm"
                variant="light"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  Status:
                </span>
                <span
                  style={{ backgroundColor: status.bg, color: status.text }}
                  className="px-3 py-1 rounded-md text-xs font-bold tracking-wide"
                >
                  {status.label}
                </span>
              </div>
            </div>
          </div>
        </Paper>
      </div>
    </AuthLayout>
  );
}

RequestDetail.title = "Request Detail Form";
export default RequestDetail;
