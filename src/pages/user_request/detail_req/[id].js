import AuthLayout from '@/components/layout/authLayout'
import requestorList from '@/data/sidebar/RequestorList';
import { Button, Paper, Textarea, Loader, Tabs, Table } from '@mantine/core'
import { IconArrowLeft, IconCalendar, IconSend, IconArrowUpRight } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import useUser from '@/store/useUser'
import useDecrypt from '@/hooks/useDecrypt';
import useApi from '@/hooks/useApi'
import useEncrypt from '@/hooks/useEncrypt';
import { formatDateTime } from "@/lib/dateFormat";
import { hasPermission } from "@/lib/permissionHelper";
import HistoryLog from "@/components/historyLog";
import Swal from 'sweetalert2'

function RequestDetail() {

  const router = useRouter()
  const { id } = router.query
  const API = useApi()
  const API_URL = API.API_URL
  const { user } = useUser()
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hodName, setHodName] = useState('');
  const [itManagerName, setItManagerName] = useState('');
  const [isHod, setIsHod] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [leadItName, setLeadItName] = useState('');
  const canApproveLeadIt = hasPermission(0);
  const canApproveItHod = hasPermission(1);

  useEffect(() => {
    if (id && user?.token) {
      fetchData();
    }
  }, [id, user?.token]);

  useEffect(() => {
    if (!data || !user) return;

    const userId = String(user.id ?? "");
    // const hodId = String(data.approval_hod_by ?? "");
    setHodName(data.approval_hod_by_name ?? data.approval_hod_by?.full_name ?? "-");
    setLeadItName(data.approval_lead_it_by_name ?? "-");
    setItManagerName(data.approval_it_hod_by_name ?? "-");
  }, [data, user]);

  useEffect(() => {
    if (data?.id_request && user?.token) {
      fetchLogs();
    }
  }, [data?.id_request, user?.token])

  const fetchData = useCallback(async () => {
    if (!id || !user?.token) return;

    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setData(prev => {
        if (JSON.stringify(prev) === JSON.stringify(res.data)) {
          return prev;
        }
        return res.data;
      });

    } catch (err) {
      console.error("Failed to fetch detail:", err);
    } finally {
      setLoading(false);
    }
  }, [id, user?.token, API_URL]);

  const fetchLogs = useCallback(async () => {
    if (!data?.id_request || !user?.token) return;

    try {
      setLoadingLog(true);

      const searchObj = { index: data.id_request };

      const sort_by = "date";
      const sort_order = "DESC";
      const page = 0;
      const size = 50;

      const res = await axios.post(
        `${API_URL}/log_portal/serverside_list?search=${encodeURIComponent(JSON.stringify(searchObj))}&sort_by=${sort_by}&sort_order=${sort_order}&page=${page}&size=${size}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setLogs(res.data?.data ?? res.data ?? []);

    } catch (err) {
      console.error("Failed to fetch log:", err);
    } finally {
      setLoadingLog(false);
    }
  }, [data?.id_request, user?.token, API_URL]);

  if (loading) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      </AuthLayout>
    )
  }

  if (!data) {
    return (
      <AuthLayout sidebarList={requestorList}>
        <div className="text-center py-10">No data found</div>
      </AuthLayout>
    )
  }

  const statusMap = {
    0: 'Draft',
    1: 'Pending by HOD Req',
    2: 'Rejected by HOD Req',
    3: 'Pending by Lead IT',
    4: 'Rejected by Lead IT',
    5: 'Pending by IT Manager',
    6: 'Rejected by IT Manager',
    7: 'Completed',
    8: 'Returned',
  };

  const statusColorMap = {
    0: 'text-gray-500',
    1: 'text-yellow-500',
    2: 'text-red-500',
    3: 'text-yellow-500',
    4: 'text-red-500',
    5: 'text-yellow-500',
    6: 'text-red-500',
    7: 'text-green-500',
    8: 'text-gray-500',
  };

  const handleSubmitToHOD = async () => {
    const confirm = await Swal.fire({
      title: `Submit this request to HOD?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API_URL}/requests/${id}/submit-to-hod`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Request submitted to HOD.`,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit request.',
      });
    }
  };

  const handleHodAction = async (action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to approve this request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    })
    if (!confirm.isConfirmed) return

    let remarks = ''
    if (action === 'reject') {
      const { value: inputRemarks } = await Swal.fire({
        title: 'Reason for Rejection',
        input: 'textarea',
        inputPlaceholder: 'Enter your reason...',
        showCancelButton: true,
      })
      if (!inputRemarks) {
        Swal.fire('Cancelled', 'You must provide a reason for rejection.', 'info')
        return
      }
      remarks = inputRemarks
    }

    try {
      const realId = id;

      await axios.put(
        `${API_URL}/requests/${realId}/hod-approval`,
        { action, remarks },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Request has been ${action}ed.`,
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      Swal.fire('Error', 'Failed to update request. Please try again.', 'error');
    }
  };

  const handleLeadItAction = async (action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });

    if (!confirm.isConfirmed) return;

    let remarks = "";
    if (action === "reject") {
      const { value: inputRemarks } = await Swal.fire({
        title: "Reason for Rejection",
        input: "textarea",
        inputPlaceholder: "Enter your reason...",
        showCancelButton: true,
      });

      if (!inputRemarks) {
        Swal.fire("Cancelled", "You must provide a reason for rejection.", "info");
        return;
      }
      remarks = inputRemarks;
    }

    try {
      const realId = id;

      await axios.put(
        `${API_URL}/requests/${realId}/lead-it-approval`,
        { action, remarks },
        { headers: { Authorization: `Bearer ${user.token}` } }
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
      console.error("Error updating status:", err);
      Swal.fire("Error", "Failed to update request. Please try again.", "error");
    }
  };

  const handleItHodAction = async (action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });

    if (!confirm.isConfirmed) return;

    let remarks = "";
    if (action === "reject") {
      const { value: inputRemarks } = await Swal.fire({
        title: "Reason for Rejection",
        input: "textarea",
        inputPlaceholder: "Enter your reason...",
        showCancelButton: true,
      });

      if (!inputRemarks) {
        Swal.fire("Cancelled", "You must provide a reason for rejection.", "info");
        return;
      }
      remarks = inputRemarks;
    }

    try {
      const realId = id;

      await axios.put(
        `${API_URL}/requests/${realId}/it-approval`,
        { action, remarks },
        { headers: { Authorization: `Bearer ${user.token}` } }
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
      console.error("Error updating status:", err);
      Swal.fire("Error", "Failed to update request. Please try again.", "error");
    }
  };

  const handleSubmitReturn = async () => {
    const confirm = await Swal.fire({
      title: `Submit this returned request back to previous step?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API_URL}/requests/${id}/submit-return`,
        { target_status: data.previous_status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Request has been submitted back to its previous step.',
        timer: 1500,
        showConfirmButton: false,
      });

      fetchData();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit returned request.',
      });
    }
  };

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white p-0 w-full overflow-hidden border border-gray-200"
        >
          {/* Header Utama */}
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-tight">
              PCMS Access Login Request
            </h1>
          </div>

          <div className="p-6 md:p-10">
            <Tabs defaultValue="detail" variant="outline" classNames={{ panel: "pt-8" }}>
              <Tabs.List>
                <Tabs.Tab value="detail" className="font-semibold text-sm">
                  DETAIL REQUEST
                </Tabs.Tab>
                <Tabs.Tab value="log" className="font-semibold text-sm">
                  HISTORY LOG
                </Tabs.Tab>
              </Tabs.List>

              {/* ================= TAB DETAIL ================= */}
              <Tabs.Panel value="detail">
                <div className="space-y-10">

                  {/* 1. INFORMASI DASAR */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block font-semibold text-gray-700 text-sm">
                        Request Date <span className="text-red-500">*</span>
                      </label>
                      <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                        {formatDateTime(data.created_date || new Date(), false)}
                        <IconCalendar size={18} className="text-gray-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-semibold text-gray-700 text-sm">
                        Requestor <span className="text-red-500">*</span>
                      </label>
                      <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                        {data?.created_by_name || '-'}
                      </div>
                    </div>
                  </div>

                  {/* 2. DESCRIPTION SECTION */}
                  <div className="space-y-6">
                    <div className="-mx-6 md:-mx-10 bg-black shadow-sm">
                      <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                        Employee Description
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Badge ID</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.badge_no || "-"}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Full Name</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.full_name || "-"}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Department</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.department_name || "-"}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Position</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.position_name || "-"}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Project</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.project_name || "-"}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Company</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.company?.company_name || "-"}</div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Access Yard Company</label>
                        <div className="min-h-[40px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md flex items-start text-sm text-gray-600">
                          {data.access_yard_company?.length ? data.access_yard_company.map(c => c.company_name).join(', ') : '-'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Application Access</label>
                        <div className="min-h-[40px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md flex items-start text-sm text-gray-600">
                          {data.access_nav_menu?.length ? data.access_nav_menu.map(n => n.application_name).join(', ') : '-'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-gray-700 text-sm">Email Address</label>
                        <div className="h-[40px] px-3 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600">{data.email || "-"}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700 text-sm">Purpose of Request</label>
                      <div className="min-h-[80px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                        {data.request_reason || "-"}
                      </div>
                    </div>
                  </div>

                  {/* 3. REMARKS SECTION */}
                  <div className="space-y-4">
                    <div className="-mx-6 md:-mx-10 bg-black shadow-sm">
                      <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                        Remarks
                      </div>
                    </div>
                    <div className="min-h-[60px] py-2 px-3 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                      {data.remarks || "-"}
                    </div>
                  </div>

                  {/* 4. APPROVAL WORKFLOW SECTION */}
                  <div className="space-y-4">
                    <div className="-mx-6 md:-mx-10 bg-black shadow-sm">
                      <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                        Approval Workflow
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-gray-300 rounded-lg divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden shadow-sm">
                      {/* Col 1: Requestor */}
                      <div className="p-4 bg-white flex flex-col min-h-[140px]">
                        <span className="text-[11px] font-bold text-gray-400 uppercase mb-auto">Requested By</span>
                        <div className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-1">
                          {data?.created_by_name || '-'}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {formatDateTime(data?.created_date)}
                        </div>
                        <span className="text-[10px] text-blue-600 font-semibold italic mt-2 uppercase tracking-tighter">Requestor</span>
                      </div>

                      {/* Col 2: HOD */}
                      <div className="p-4 bg-white flex flex-col min-h-[140px]">
                        <span className="text-[11px] font-bold text-gray-400 uppercase mb-auto">Acknowledge By</span>
                        <div className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-1">
                          {data.approval_hod_by?.full_name || "-"}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {data?.approval_hod_date_at ? formatDateTime(data?.approval_hod_date_at) : 'Pending...'}
                        </div>
                        {data.request_status === 1 && (
                          <div className="mt-3 flex gap-1">
                            <Button variant="light" color="green" size="compact-xs" onClick={() => handleHodAction('approve')}>Approve</Button>
                            <Button variant="light" color="red" size="compact-xs" onClick={() => handleHodAction('reject')}>Reject</Button>
                          </div>
                        )}
                        <span className="text-[10px] text-blue-600 font-semibold italic mt-auto uppercase tracking-tighter">HOD Requestor</span>
                      </div>

                      {/* Col 3: Lead IT */}
                      <div className="p-4 bg-white flex flex-col min-h-[140px]">
                        <span className="text-[11px] font-bold text-gray-400 uppercase mb-auto">Checked By</span>
                        <div className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-1">
                          {data.approval_lead_it_by?.full_name || "-"}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {data?.approval_lead_date_at ? formatDateTime(data?.approval_lead_date_at) : 'Pending...'}
                        </div>
                        {canApproveLeadIt && data.request_status === 3 && (
                          <div className="mt-3 flex gap-1">
                            <Button variant="light" color="green" size="compact-xs" onClick={() => handleLeadItAction("approve")}>Approve</Button>
                            <Button variant="light" color="red" size="compact-xs" onClick={() => handleLeadItAction("reject")}>Reject</Button>
                          </div>
                        )}
                        <span className="text-[10px] text-blue-600 font-semibold italic mt-auto uppercase tracking-tighter">Lead IT</span>
                      </div>

                      {/* Col 4: IT Manager */}
                      <div className="p-4 bg-white flex flex-col min-h-[140px]">
                        <span className="text-[11px] font-bold text-gray-400 uppercase mb-auto">Approved By</span>
                        <div className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-1">
                          {data.approval_it_hod_by?.full_name || "-"}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {data?.approval_it_date_at ? formatDateTime(data?.approval_it_date_at) : 'Pending...'}
                        </div>
                        {canApproveItHod && data.request_status === 5 && (
                          <div className="mt-3 flex gap-1">
                            <Button variant="light" color="green" size="compact-xs" onClick={() => handleItHodAction("approve")}>Approve</Button>
                            <Button variant="light" color="red" size="compact-xs" onClick={() => handleItHodAction("reject")}>Reject</Button>
                          </div>
                        )}
                        <span className="text-[10px] text-blue-600 font-semibold italic mt-auto uppercase tracking-tighter">IT Manager</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS & STATUS */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
                    <Button
                      leftSection={<IconArrowLeft size={18} />}
                      color="gray"
                      size="sm"
                      onClick={() => router.back()}
                    >
                      Back
                    </Button>

                    <div className="flex flex-wrap justify-center items-center gap-4">
                      <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs font-bold text-gray-500 uppercase mr-2">Status:</span>
                        {(() => {
                          const status = data.request_status;
                          const prev = data.previous_status;
                          const finalStatus = status === 8 ? prev : status;
                          return (
                            <span className={`text-sm font-bold ${statusColorMap[finalStatus] || "text-gray-600"}`}>
                              {statusMap[finalStatus]}
                            </span>
                          );
                        })()}
                      </div>

                      {data.request_status === 0 && (
                        <Button
                          leftSection={<IconSend size={16} />}
                          color="green"
                          onClick={handleSubmitToHOD}
                        >
                          Submit to HOD
                        </Button>
                      )}

                      {data.request_status === 8 && (
                        <Button
                          leftSection={<IconArrowUpRight size={16} />}
                          color="green"
                          onClick={handleSubmitReturn}
                        >
                          Submit Returned Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Tabs.Panel>

              {/* ================= TAB LOG ================= */}
              <Tabs.Panel value="log">
                <HistoryLog
                  logs={logs}
                  statusMap={statusMap}
                  idRequest={data?.id_request}
                />
              </Tabs.Panel>
            </Tabs>
          </div>
        </Paper>
      </div>
    </AuthLayout>
  );
}

RequestDetail.title = "Request Detail Form";
export default RequestDetail;
