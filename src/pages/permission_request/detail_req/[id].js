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
  const [isHod, setIsHod] = useState(true);
  const [isItHod, setIsItHod] = useState(true);

  useEffect(() => {
    if (user?.role?.role_name === 'head_of_department') {
      if (data?.request_status === 3) {
        setIsItHod(true);
      } else if (data?.request_status === 1) {
        setIsHod(true);
      }
    }
  }, [user, data]);

  useEffect(() => {
    if (data) {
      setHodName(
        data.approval_hod_by
          ? `${data.approval_hod_by.badge_no} - ${data.approval_hod_by.full_name}`
          : "-"
      );

      setItManagerName(
        data.approval_it_hod_by
          ? `${data.approval_it_hod_by.badge_no} - ${data.approval_it_hod_by.full_name}`
          : "-"
      );
    }
  }, [data]);

  useEffect(() => {
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
    1: 'Pending by HOD',
    2: 'Rejected by HOD',
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
    try {
      const payload = {};
      if (action === 'approve') {
        payload.approval_hod_by = user.id_user;
        payload.request_status = 3;
      } else if (action === 'reject') {
        payload.approval_hod_by = user.id_user;
        payload.request_status = 2;
        payload.rejected_hod_remarks = "Rejected by HOD";
      }

      await axios.put(`${API_URL}/requests/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      alert(`Request ${action} successfully`);
      const res = await axios.get(`${API_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update request');
    }
  };

  const handleItAction = async (action) => {
    try {
      const payload = {};
      if (action === 'approve') {
        payload.approval_it_hod_by = user.id_user;
        payload.request_status = 5;
      } else if (action === 'reject') {
        payload.approval_it_hod_by = user.id_user;
        payload.request_status = 4;
        payload.rejected_it_remarks = "Rejected by IT";
      }

      await axios.put(`${API_URL}/requests/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      alert(`Request ${action} successfully`);
      const res = await axios.get(`${API_URL}/requests/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update request');
    }
  };

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="bg-gray-100 py-10 flex justify-center">
        <Paper
          radius="md"
          shadow="sm"
          className="bg-white py-8 px-10 space-y-6 w-full max-w-4xl mx-auto text-sm leading-relaxed"
        >
          {/* Header */}
          <div className="text-center mb-4">
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
                <span>{formatDate(new Date())}</span>
                <IconCalendar size={16} className="text-gray-500" />
              </div>
            </div>

            <div>
              <label className="font-medium mb-1 text-gray-800 text-sm">
                Requestor <span className="text-red-500">*</span>
              </label>
              <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                {user?.name || ''}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2 mt-6">
            <div className="-mx-10 bg-black shadow-sm">
              <div className="px-10 py-2 text-base font-semibold text-white">
                Description
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Name */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.full_name || "-"}
                </div>
              </div>

              {/* Badge No */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Badge No <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.badge_no || "-"}
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

              {/* Project */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.project_name || data.project?.project_name || "-"}
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Department <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.department_name || data.department?.name_of_department || "-"}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {data.role_name || data.role?.role_name || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2 mt-6">
            <div className="-mx-10 bg-black shadow-sm">
              <div className="px-10 py-2 text-base font-semibold text-white">
                Remarks
              </div>
            </div>

            <Textarea
              label={<span className="font-medium text-sm">Reason of Request</span>}
              value={data.request_reason || ""}
              readOnly
              minRows={3}
              className="text-sm"
            />
          </div>

          {/* Signature Section */}
          <div className="space-y-2 mt-6">
            <div className="-mx-10 bg-black shadow-sm">
              <div className="px-10 py-2 text-base font-semibold text-white flex">
                <div className="flex-1 text-center">Requestor Department</div>
                <div className="flex-1 text-center">Head of Department</div>
                <div className="flex-1 text-center">Information Technology Manager</div>
              </div>
            </div>

            <div className="bg-white rounded-b-md text-black flex flex-col md:flex-row text-sm">
              {/* Requested by */}
              <div className="w-full md:flex-1 min-w-[250px] p-3 md:border-r border-gray-300">
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Requested By
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {user?.name || ''}
                </div>
              </div>

              {/* Acknowledge by */}
              <div className="w-full md:flex-1 min-w-[250px] p-3 md:border-r border-gray-300">
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Acknowledge By
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {hodName}
                </div>

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

                {/* IT HOD approve/reject */}
                {isItHod && data.request_status === 3 && (
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

              {/* Approved */}
              <div className="w-full md:flex-1 min-w-[250px] p-3">
                <label className="font-medium mb-1 text-gray-800 text-sm">
                  Approved By
                </label>
                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                  {itManagerName}
                </div>
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
