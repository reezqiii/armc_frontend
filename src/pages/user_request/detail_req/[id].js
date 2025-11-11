import AuthLayout from '@/components/layout/authLayout'
import { requestorList } from '@/data/sidebar/RequestorList'
import { Button, Paper, Textarea, Loader } from '@mantine/core'
import { IconArrowLeft, IconCalendar } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useUser from '@/store/useUser'
import useApi from '@/hooks/useApi'
import { formatDate } from "@/lib/dateFormat";
import Swal from 'sweetalert2'

export default function RequestDetail() {
  RequestDetail.title = "Request Detail Form"
  const router = useRouter()
  const { id } = router.query
  const API = useApi()
  const API_URL = API.API_URL
  const { user } = useUser()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hodName, setHodName] = useState('');
  const [itManagerName, setItManagerName] = useState('');
  const [isHod, setIsHod] = useState(false);
  const [isItHod, setIsItHod] = useState(false);
  const [isLeadIt, setIsLeadIt] = useState(false);
  const [leadItName, setLeadItName] = useState('');

  useEffect(() => {
    if (!data || !user) return;

    const userIdLogin = user.id;
    const hodIdRequest = data.approval_hod_by?.id;

    setIsHod(false);
    setIsLeadIt(false);
    setIsItHod(false);

    const isIdMatch = userIdLogin?.toString() === hodIdRequest?.toString();

    if (isIdMatch && data.request_status === 1) {
      setIsHod(true);
    }
    else if (data.request_status === 3) {
      setIsLeadIt(true);
    }
    else if (data.request_status === 5) {
      setIsItHod(true);
    }
  }, [data, user]);

  useEffect(() => {
    if (data) {
      setHodName(
        data.approval_hod_by
          ? data.approval_hod_by.full_name
          : "-"
      );

      setLeadItName(
        data.approval_lead_it_by
          ? data.approval_lead_it_by.full_name
          : "-"
      );

      setItManagerName(
        data.approval_it_hod_by
          ? data.approval_it_hod_by.full_name
          : "-"
      );
    }
  }, [data]);

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      setData(res.data)
    } catch (err) {
      console.error('Failed to fetch detail:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id && user?.token) fetchData()
  }, [id, user?.token, API_URL])

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
  };

  const handleHodAction = async (action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action.toUpperCase()} this request?`,
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
      await axios.put(
        `${API_URL}/requests/${id}/hod-approval`,
        { action, remarks },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )

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

  const handleItAction = async (action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action.toUpperCase()} this request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });
    if (!confirm.isConfirmed) return;

    let remarks = '';
    if (action === 'reject') {
      const { value: inputRemarks } = await Swal.fire({
        title: 'Reason for Rejection',
        input: 'textarea',
        inputPlaceholder: 'Enter your reason...',
        showCancelButton: true,
      });
      if (!inputRemarks) {
        Swal.fire('Cancelled', 'You must provide a reason for rejection.', 'info');
        return;
      }
      remarks = inputRemarks;
    }

    try {
      await axios.put(
        `${API_URL}/requests/${id}/it-approval`,
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
      Swal.fire('Error', 'Failed to update request. Please try again.', 'error')
    }
  }

  const handleLeadItAction = async (action) => {
    const confirm = await Swal.fire({
      title: `Are you sure you want to ${action.toUpperCase()} this request?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
    });
    if (!confirm.isConfirmed) return;

    let remarks = '';
    if (action === 'reject') {
      const { value: inputRemarks } = await Swal.fire({
        title: 'Reason for Rejection',
        input: 'textarea',
        inputPlaceholder: 'Enter your reason...',
        showCancelButton: true,
      });
      if (!inputRemarks) {
        Swal.fire('Cancelled', 'You must provide a reason for rejection.', 'info');
        return;
      }
      remarks = inputRemarks;
    }

    try {
      await axios.put(
        `${API_URL}/requests/${id}/lead-it-approval`,
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

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="bg-gray-100 min-h-screen py-10 px-6 md:px-10 w-full">
        <Paper
          radius="md"
          shadow="xl"
          className="bg-white py-8 px-10 w-full space-y-6 text-sm leading-relaxed"
        >

          {/* Header */}
          <div className=" border-b py-4 text-center">
            <h1 className="text-xl font-bold text-blue-500">
              PCMS ACCESS LOGIN REQUEST
            </h1>
          </div>

          {/* Request Info */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="font-medium mb-1 text-gray-800 text-sm">
                Request Date <span className="text-red-500">*</span>
              </label>
              <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-between text-sm">
                <span>{formatDate(data.created_date)}</span>
                <IconCalendar size={16} className="text-gray-500" />
              </div>
            </div>

            <div>
              <label className="font-medium mb-1 text-gray-800 text-sm">
                Requestor <span className="text-red-500">*</span>
              </label>
              <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                {data?.created_by_name || '-'}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2 mt-6">
            <div className="-mx-10 bg-black shadow-sm">
              <div className="px-10 py-3 mb-4 text-base font-semibold text-white">
                Description
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Badge No */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Badge ID <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.badge_no || "-"}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.full_name || "-"}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.department_name || "-"}
                </div>
              </div>

              {/* Position */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Position <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.position_name || "-"}
                </div>
              </div>

              {/* Project */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.project_name || "-"}
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Company <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data?.company?.company_name || "-"}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.email || "-"}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm min-h-[60px] flex items-start">
                  <span>{data.request_reason || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2 mt-6">
            <div className="-mx-10 bg-black shadow-sm">
              <div className="px-10 py-3 mb-4 text-base font-semibold text-white">
                Remarks
              </div>
            </div>

            <div>
              <label className="font-medium text-sm text-gray-800">
                Remarks (Optional)
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm min-h-[60px] flex items-start">
                <span>{data.remarks || "-"}</span>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="space-y-2 mt-6">
            <div className="-mx-10 bg-black shadow-sm">
              <div className="px-10 py-3 text-base font-semibold text-white grid grid-cols-4 text-center">
                <div>Requestor</div>
                <div>HOD Requestor</div>
                <div>Lead IT</div>
                <div>Asst. IT Manager/IT Manager</div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="bg-white rounded-b-md text-black grid grid-cols-1 md:grid-cols-4 gap-4 p-4 text-sm">
              <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">Requested By :</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <p>
                    <span className="font-medium">Name :</span>{' '}
                    {data?.created_by_name || '-'}
                  </p>
                  <p>
                    <span className="font-medium">Date :</span>{' '}
                    {data?.created_date
                      ? new Date(data.created_date).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                      : '-'}
                  </p>
                </div>
              </div>

              {/* Head of Department */}
              <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">Acknowledge By :</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <p>
                    <span className="font-medium">Name :</span>{' '}
                    {hodName || '-'}
                  </p>
                  <p>
                    <span className="font-medium">Date :</span>{' '}
                    {data?.approval_hod_date_at
                      ? new Date(data.approval_hod_date_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                      : '-'}
                  </p>
                </div>
                {/* HOD Actions */}
                {isHod && data.request_status === 1 && (
                  <div className="mt-3 flex gap-2">
                    <Button color="green" size="sm" onClick={() => handleHodAction('approve')}>
                      Approve
                    </Button>
                    <Button color="red" size="sm" onClick={() => handleHodAction('reject')}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* Lead IT */}
              <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">Checked By :</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <p>
                    <span className="font-medium">Name :</span>{' '}
                    {leadItName || '-'}
                  </p>
                  <p>
                    <span className="font-medium">Date :</span>{' '}
                    {data?.approval_lead_date_at
                      ? new Date(data.approval_lead_date_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                      : '-'}
                  </p>
                </div>

                {isLeadIt && data.request_status === 3 && (
                  <div className="mt-3 flex gap-2">
                    <Button color="green" size="sm" onClick={() => handleLeadItAction('approve')}>
                      Approve
                    </Button>
                    <Button color="red" size="sm" onClick={() => handleLeadItAction('reject')}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* IT Manager */}
              <div className="border border-gray-300 rounded-lg shadow-sm p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">Approved By :</h3>
                <div className="flex flex-col gap-1 text-sm">
                  <p>
                    <span className="font-medium">Name :</span>{' '}
                    {itManagerName || '-'}
                  </p>
                  <p>
                    <span className="font-medium">Date :</span>{' '}
                    {data?.approval_it_date_at
                      ? new Date(data.approval_it_date_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                      : '-'}
                  </p>
                </div>

                {isItHod && data.request_status === 5 && (
                  <div className="mt-3 flex gap-2">
                    <Button color="green" size="sm" onClick={() => handleItAction('approve')}>
                      Approve
                    </Button>
                    <Button color="red" size="sm" onClick={() => handleItAction('reject')}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-6">
            <Button
              leftSection={<IconArrowLeft size={16} />}
              color="gray"
              size="sm"
              onClick={() => router.back()}
            >
              Back
            </Button>

            <div className="text-sm font-semibold text-gray-600 flex items-center">
              Status:
              <span className={`ml-2 ${statusColorMap[data.request_status] || 'text-gray-600'}`}>
                {statusMap[data.request_status]}
              </span>
            </div>
          </div>
        </Paper>
      </div>
    </AuthLayout>
  )
}

