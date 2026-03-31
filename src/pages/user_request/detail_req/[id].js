import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import { Button, Paper, Loader } from "@mantine/core";
import {
  IconArrowLeft,
  IconCalendar,
  IconSend,
  IconX,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import usePermission from "@/hooks/usePermission";
import Swal from "sweetalert2";
import { formatDate } from "@/lib/dateFormat";
import { getRequestStatus } from "@/lib/requestStatusList";

function RequestDetail() {
  const router = useRouter();
  const { id } = router.query;
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();
  const { can } = usePermission();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isApprover = (approverId) => {
    if (!approverId) return false;
    return String(user?.id) === String(approverId);
  };

  const canApproveHod =
    data?.request_status === 1 && isApprover(data?.approval_hod_by?.id);

  const canApproveItHod =
    data?.request_status === 5 && can("request.it_approval");

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

  const handleSubmitToHOD = async () => {
    const confirm = await Swal.fire({
      title: "Submit this request to HOD?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d9488",
    });
    if (!confirm.isConfirmed) return;
    try {
      await axios.put(
        `${API_URL}/requests/${id}/submit-to-hod`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Request submitted to HOD.",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit request.",
      });
    }
  };

  const handleApproval = async (endpoint, action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: action === "approve" ? "#0d9488" : "#d33",
    });
    if (!confirm.isConfirmed) return;

    let remarks = "";
    if (action === "reject") {
      const { value } = await Swal.fire({
        title: "Reason for Rejection",
        input: "textarea",
        inputPlaceholder: "Enter your reason...",
        showCancelButton: true,
      });
      if (!value) {
        Swal.fire("Cancelled", "You must provide a reason.", "info");
        return;
      }
      remarks = value;
    }

    try {
      await axios.put(
        `${API_URL}/requests/${id}/${endpoint}`,
        { action, remarks },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Request has been ${action}ed.`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire("Error", "Failed to update request.", "error");
    }
  };

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
          {/* Header — sama persis dengan create */}
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-teal-600 uppercase tracking-tight">
              PCMS Access Login Request Form
              {data?.id_request &&
                ` — ITF14-${String(data.id_request).padStart(6, "0")}`}
            </h1>
          </div>

          {/* ── Semua konten dalam satu div p-6 md:p-10 space-y-10 ── */}
          <div className="p-6 md:p-10 space-y-10">
            {/* 1. Date & Requestor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 text-sm">
                  Request Date <span className="text-red-500">*</span>
                </label>
                <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                  {formatDate(data.created_date)}
                  <IconCalendar size={18} className="text-gray-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-gray-700 text-sm">
                  Requestor <span className="text-red-500">*</span>
                </label>
                <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                  {data?.created_by_name || data?.requestor_name || "-"}
                </div>
              </div>
            </div>

            {/* 2. Employee Description */}
            <div className="space-y-6">
              <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                  Employee Description
                </div>
              </div>

              {/* Baris 1: Category | Badge | Full Name */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Category Account <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.category_account_name || data.category?.name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Badge ID <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.badge_no || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.full_name || "-"}
                  </div>
                </div>
              </div>

              {/* Baris 2: Dept | Project | Application Access */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.department_name || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.project_name || data.project || "-"}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Application Access <span className="text-red-500">*</span>
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
              </div>

              {/* Baris 3: Email — 1 kolom saja */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 text-sm">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">
                    {data.email || "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Purpose & Remarks */}
            <div className="space-y-4">
              <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                  Purpose &amp; Remarks
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-sm">
                  Purpose of Request <span className="text-red-500">*</span>
                </label>
                <div className="min-h-[80px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600 leading-relaxed">
                  {data.request_reason || "-"}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700 text-sm">
                  Additional Remarks (Optional)
                </label>
                <div className="min-h-[60px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600 leading-relaxed">
                  {data.remarks || "-"}
                </div>
              </div>
            </div>

            {/* 4. Approval Workflow */}
            <div className="space-y-4">
              <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {["Requestor", "Head of Department", "HOD IT"].map(
                      (label) => (
                        <span key={label}>{label}</span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Cards — sama struktur border dengan create form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-300 rounded-lg divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden shadow-sm">
                {/* Col 1 — Requestor */}
                <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    Requested By
                  </span>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-semibold text-teal-700 flex-shrink-0">
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
                <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    Acknowledge By
                  </span>
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-semibold text-teal-700 flex-shrink-0">
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
                          <IconClock size={10} /> Pending approval
                        </p>
                      )}
                    </div>
                  </div>

                  {canApproveHod && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        size="xs"
                        variant="light"
                        color="teal"
                        leftSection={<IconCheck size={12} />}
                        onClick={() =>
                          handleApproval("hod-approval", "approve")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<IconX size={12} />}
                        onClick={() => handleApproval("hod-approval", "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

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

                {/* Col 3 — HOD IT */}
                <div className="p-4 bg-gray-50/50 flex flex-col justify-between min-h-[120px]">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                    Approved By
                  </span>

                  {data?.approval_it_hod_by?.full_name ? (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[12px] font-semibold text-teal-700 flex-shrink-0">
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
                      <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <svg
                          width="15"
                          height="15"
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
                          <IconClock size={10} /> Waiting approval...
                        </p>
                      </div>
                    </div>
                  )}

                  {canApproveItHod && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button
                        size="xs"
                        variant="light"
                        color="teal"
                        leftSection={<IconCheck size={12} />}
                        onClick={() => handleApproval("it-approval", "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<IconX size={12} />}
                        onClick={() => handleApproval("it-approval", "reject")}
                      >
                        Reject
                      </Button>
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
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <Button
                leftSection={<IconArrowLeft size={18} />}
                color="gray"
                size="sm"
                onClick={() => router.back()}
              >
                Back
              </Button>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Status:
                  </span>
                  <span
                    style={{ backgroundColor: status.bg, color: status.text }}
                    className="px-3 py-0.5 rounded text-xs font-semibold"
                  >
                    {status.label}
                  </span>
                </div>
                {data.request_status === 0 && (
                  <Button
                    leftSection={<IconSend size={16} />}
                    color="teal"
                    size="sm"
                    onClick={handleSubmitToHOD}
                  >
                    Submit to HOD Request
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* end p-6 md:p-10 */}
        </Paper>
      </div>
    </AuthLayout>
  );
}

RequestDetail.title = "Request Detail Form";
export default RequestDetail;
