import AuthLayout from '@/components/layout/authLayout';
import { requestorList } from '@/data/sidebar/RequestorList';
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconCalendar } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useUser from '@/store/useUser';
import useSwal from '@/hooks/useSwal';
import useApi from '@/hooks/useApi';
import Swal from "sweetalert2";
import { formatDate } from "@/lib/dateFormat";

export default function EditRequest() {
    EditRequest.title = "Edit Request Form"
    const router = useRouter()
    const { id } = router.query;
    const { showAlert } = useSwal()
    const API = useApi()
    const API_URL = API.API_URL
    const { user } = useUser()

    const [formData, setFormData] = useState({
        full_name: '',
        badge_no: '',
        email: '',
        project: '',
        department: '',
        request_reason: '',
        approval_hod_by: '',
        approval_it_hod_by: '',
    })

    const [errors, setErrors] = useState({})
    const [projects, setProjects] = useState([])
    const [departments, setDepartments] = useState([])
    const [hodList, setHodList] = useState([])
    const [itManagerName, setItManagerName] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    useEffect(() => {
        const fetchDropdowns = async () => {
            setLoading(true);
            try {
                const [projRes, deptRes] = await Promise.all([
                    axios.get(`${API_URL}/portal_project`, { headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' } }),
                    axios.get(`${API_URL}/portal_department`, { headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' } }),
                ]);
                setProjects(projRes.data || []);
                setDepartments(deptRes.data || []);
            } catch (err) {
                console.error('Dropdown fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDropdowns();
    }, [API_URL, user.token]);

    useEffect(() => {
        if (!id) return;

        const fetchRequest = async () => {
            try {
                const res = await axios.get(`${API_URL}/requests/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const data = res.data;
                setFormData({
                    full_name: data.full_name || '',
                    badge_no: data.badge_no || '',
                    email: data.email || '',
                    project: data.project?.id?.toString() || '',
                    department: data.department?.id_department?.toString() || '',
                    request_reason: data.request_reason || '',
                    request_status: data.request_status ?? 0,
                    approval_hod_by: data.approval_hod_by?.id_user?.toString() || '',
                    approval_it_hod_by: data.approval_it_hod_by?.id_user?.toString() || '',

                });

                setItManagerName(
                    data.approval_it_hod_by
                        ? `${data.approval_it_hod_by.badge_no} - ${data.approval_it_hod_by.full_name}`
                        : "-"
                );

                if (data.approval_hod_by) {
                    const resHod = await axios.get(`${API_URL}/api/user/search`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                        params: { role: 'head_of_department' }
                    });
                    const activeHod = resHod.data.filter(u => u.status_user === 1);
                    setHodList(activeHod);
                }

            } catch (err) {
                console.error('Failed to fetch request:', err);
                showAlert("Error", "error", "Failed to load request data");
            }
        };

        fetchRequest();
    }, [id, API_URL, user.token]);

    const handleChange = (field, value) => {
        if (field === 'approval_hod_by') {
            const num = Number(value);
            setFormData(prev => ({
                ...prev,
                [field]: isNaN(num) ? null : num
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }

        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoadingSubmit(true)

        const result = await Swal.fire({
            title: id ? "Are you sure you want to update this data?" : "Are you sure you want to create a new request?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: id ? "Yes, update!" : "Yes, save",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
        });

        if (!result.isConfirmed) return;

        setLoadingSubmit(true);

        const payload = {
            full_name: formData.full_name,
            badge_no: formData.badge_no,
            email: formData.email,
            request_type: 1,
            request_reason: formData.request_reason,
            request_status: formData.request_status,
            status_active: 1,
            project: { id: Number(formData.project) },
            department: { id_department: Number(formData.department) },
        }

        // HOD optional
        payload.approval_hod_by = formData.approval_hod_by
            ? { id_user: Number(formData.approval_hod_by) }
            : null;

        try {
            if (id) {
                await axios.put(`${API_URL}/requests/${id}`, payload, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await axios.post(`${API_URL}/requests/create`, payload, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }

            router.push("/user_request/requestor_list");
        } catch (error) {
            console.error(error.response?.data || error.message);
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: "An error occurred while saving the data. Please try again.",
            });
        } finally {
            setLoadingSubmit(false);
        }
    };

    // 🔸 Render
    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="bg-gray-100 py-10 flex justify-center">
                <Paper
                    radius="md"
                    shadow="sm"
                    className="bg-white py-8 px-10 space-y-6 w-full max-w-4xl mx-auto text-[15px] leading-relaxed"
                >
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold text-blue-500">
                            PCMS ACCESS LOGIN REQUEST
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit}>
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
                                <div className="h-[40px] px-3 bg-gray-100 border border-gray-300 rounded-md text-sm flex items-center">
                                    {user?.name || ''}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 mt-6">
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-2 text-base font-semibold text-white">
                                    Description
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Name</span>}
                                    placeholder="Input full name..."
                                    value={formData.full_name}
                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                    error={errors.full_name}
                                />

                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Badge ID</span>}
                                    placeholder="Input badge ID..."
                                    value={formData.badge_no}
                                    onChange={(e) => handleChange('badge_no', e.target.value)}
                                    error={errors.badge_no}
                                />

                                <TextInput
                                    required
                                    type="email"
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Email</span>}
                                    placeholder="example@company.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    error={errors.email}
                                />

                                <Select
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Project</span>}
                                    placeholder="Select project..."
                                    data={projects.map(p => ({
                                        value: p.id?.toString(),
                                        label: p.project_name || 'Unnamed Project'
                                    }))}
                                    searchable
                                    value={formData.project}
                                    onChange={(v) => handleChange('project', v)}
                                    error={errors.project}
                                />

                                <Select
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Department</span>}
                                    placeholder="Select department..."
                                    data={departments.map(d => ({
                                        value: d.id_department?.toString(),
                                        label: d.name_of_department || 'Unnamed Department'
                                    }))}
                                    searchable
                                    value={formData.department}
                                    onChange={(v) => handleChange('department', v)}
                                    error={errors.department}
                                />

                            </div>
                        </div>

                        {/* Remarks Section */}
                        <div className="space-y-2 mt-6">
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-2 text-base font-semibold text-white">
                                    Remarks
                                </div>
                            </div>

                            <Textarea label={<span className="font-medium text-sm">Reason of Request</span>}
                                placeholder="Input request reason..."
                                value={formData.request_reason}
                                onChange={(e) => handleChange('request_reason', e.target.value)}
                                minRows={3}
                                error={errors.request_reason}
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
                                <div className="w-full md:flex-1 min-w-[250px] p-3 md:border-r border-gray-300">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Requested By
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                                        {user?.name || ''}
                                    </div>
                                </div>

                                <div className="w-full md:flex-1 min-w-[250px] p-3 md:border-r border-gray-300">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Acknowledged By
                                    </label>
                                    <Select
                                        placeholder="-- Select HOD --"
                                        data={hodList.map(h => ({
                                            value: h.id_user.toString(),
                                            label: `${h.badge_no} - ${h.full_name}`
                                        }))}
                                        searchable
                                        value={formData.approval_hod_by?.toString() || ''}
                                        onChange={(v) => handleChange('approval_hod_by', v)}
                                        disabled={formData.request_status !== 0}
                                    />
                                </div>

                                <div className="w-full md:flex-1 min-w-[250px] p-3">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Approved By
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                                        {itManagerName || 'Loading...'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6">
                                <Button leftSection={<IconArrowLeft size={18} />} color="gray" size="sm" onClick={() => router.back()}>
                                    Back
                                </Button>
                                <Button type="submit" leftSection={<IconDeviceFloppy size={18} />}
                                    color="blue" radius="sm" size="sm" loading={loadingSubmit}>
                                    {id ? 'Update' : 'Submit'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Paper>
            </div>
        </AuthLayout>
    )
}
