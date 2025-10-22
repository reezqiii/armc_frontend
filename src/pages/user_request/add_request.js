import AuthLayout from '@/components/layout/authLayout'
import { requestorList } from '@/data/sidebar/RequestorList'
import { Button, Paper, TextInput, Textarea, Select } from '@mantine/core'
import { IconArrowLeft, IconDeviceFloppy, IconCalendar } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import useUser from '@/store/useUser'
import useSwal from '@/hooks/useSwal'
import useApi from '@/hooks/useApi'

export default function CreateRequest() {
    CreateRequest.title = "Create Request Form"
    const router = useRouter()
    const { showAlert } = useSwal()
    const API = useApi();
    const API_URL = API.API_URL;
    const { user } = useUser()

    const [formData, setFormData] = useState({
        department: null,
        request_date: new Date(),
        full_name: '',
        badge_no: '',
        email: '',
        project: null,
        role: null,
        request_reason: '',
    });

    const [projects, setProjects] = useState([])
    const [departments, setDepartments] = useState([])
    const [roles, setRoles] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [projRes, deptRes, roleRes] = await Promise.all([
                    axios.get(`${API_URL}/portal_project`, {
                        headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' },
                    }),
                    axios.get(`${API_URL}/portal_department`, {
                        headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' },
                    }),
                    axios.get(`${API_URL}/portal_master_role_permission_db`, {
                        headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' },
                    }),
                ]);

                // Pastikan data array, fallback ke []
                setProjects(Array.isArray(projRes.data) ? projRes.data : []);
                setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
                setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
            } catch (err) {
                console.error('Failed to fetch dropdown data:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL, user.token]);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Validasi field required
        const requiredFields = ["employee_name", "employee_id", "email", "project", "department", "role", "reason"];
        for (let field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === "") {
                showAlert("Failed", "error", `Field "${field.replace("_", " ")}" is required`);
                return;
            }
        }

        // Payload sesuai BE
        const payload = {
            full_name: formData.full_name,
            badge_no: formData.badge_no,
            email: formData.email,
            request_type: 1,
            request_reason: formData.request_reason,
            request_status: 0,
            created_by: user.id,
            status_active: 1,
            project: { id: Number(formData.project) },
            department: { id_department: Number(formData.department) },
            role: { id_role: Number(formData.role) },

        };

        try {
            const response = await axios.post(`${API_URL}/requests/create`, payload, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (response.status === 200 || response.status === 201) {
                showAlert("Success", "success", "Request submitted successfully");
                router.push('/user_request/requestor_list');
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            showAlert("Failed", "error", "Something went wrong");
        }
    }

    return (
        <AuthLayout sidebarList={requestorList}>
            <div className="bg-gray-100 py-10 flex justify-center">
                <Paper
                    radius="md"
                    shadow="sm"
                    className="bg-white py-8 px-10 space-y-6 w-full max-w-4xl mx-auto text-[15px] leading-relaxed"
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-blue-500 tracking-wide">
                            PCMS ACCESS LOGIN REQUEST FORM
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4">
                        {/* Requestor Info */}
                        <div className="grid grid-cols-1 gap-3">
                            {/* Requestor Date */}
                            <div>
                                <label className="block text-base font-bold mb-1 text-gray-800">
                                    Requestor Date <span className="text-red-500">*</span>
                                </label>
                                <div className="h-[40px] px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm flex items-center justify-between">
                                    <span>{new Date().toLocaleDateString('en-US')}</span>
                                    <IconCalendar size={18} className="text-gray-500" />
                                </div>
                            </div>

                            {/* Requestor */}
                            <div>
                                <label className="block text-base font-bold mb-1 text-gray-800">
                                    Requestor <span className="text-red-500">*</span>
                                </label>
                                <div className="h-[40px] px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm flex items-center">
                                    {user?.name || ''}
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-2 mt-6">
                            {/* Full-width black header */}
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-3 font-semibold text-lg text-white">
                                    Description
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                {/* Employee Name */}
                                <TextInput
                                    fullWidth
                                    size="sm"
                                    label={
                                        <span className="font-bold text-sm">
                                            Name <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="Input employee name..."
                                    value={formData.full_name || ''}
                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                />

                                {/* Employee ID */}
                                <TextInput
                                    fullWidth
                                    size="sm"
                                    label={
                                        <span className="font-bold text-sm">
                                            Employee ID <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="Input employee ID..."
                                    value={formData.badge_no || ''}
                                    onChange={(e) => handleChange('badge_no', e.target.value)}
                                />

                                {/* Email */}
                                <TextInput
                                    fullWidth
                                    size="sm"
                                    label={
                                        <span className="font-bold text-sm">
                                            Email <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="example@company.com"
                                    value={formData.email || ''}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                />

                                {/* Project */}
                                <Select
                                    fullWidth
                                    size="sm"
                                    label={<span className="font-bold text-sm">Project <span className="text-red-500">*</span></span>}
                                    placeholder="Select project..."
                                    data={projects
                                        .filter((p) => p?.id)
                                        .map((p) => ({
                                            value: p.id.toString(),
                                            label: p.project_name || 'Unnamed Project',
                                        }))}
                                    searchable
                                    value={formData.project || ''}
                                    onChange={(value) => handleChange('project', Number(value))}
                                />

                                {/* Department */}
                                <Select
                                    fullWidth
                                    size="sm"
                                    label={<span className="font-bold text-sm">Department <span className="text-red-500">*</span></span>}
                                    placeholder="Select department..."
                                    data={departments
                                        .filter((d) => d?.id_department)
                                        .map((d) => ({
                                            value: d.id_department.toString(),
                                            label: d.name_of_department || 'Unnamed Department',
                                        }))}
                                    searchable
                                    value={formData.department || ''}
                                    onChange={(value) => handleChange('department', Number(value))}
                                />

                                {/* Role */}
                                <Select
                                    fullWidth
                                    size="sm"
                                    label={
                                        <span className="font-bold text-sm">
                                            Role <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder="Select role..."
                                    data={roles.map((r) => ({
                                        value: r.id_role.toString(),
                                        label: r.role_name || 'Unnamed Role',
                                    }))}
                                    searchable
                                    value={formData.role || ''}
                                    onChange={(value) => handleChange('role', Number(value))}

                                />
                            </div>
                        </div>

                        {/* Remarks Section */}
                        <div className="space-y-2 mt-6">
                            {/* Full-width black header */}
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-3 text-lg font-semibold text-white">
                                    Remarks
                                </div>
                            </div>
                            <Textarea
                                size="sm"
                                label={<span className="font-bold text-sm">Request Reason <span className="text-red-500">*</span></span>}
                                placeholder="Input request reason..."
                                value={formData.reason}
                                onChange={(e) => handleChange('reason', e.target.value)}
                                minRows={3}
                            />
                        </div>

                        {/* Signature Section */}
                        <div className="space-y-2 mt-6">
                            {/* Header bar */}
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-3 text-lg font-semibold text-white flex">
                                    <div className="flex-1 text-center">Requestor Department</div>
                                    <div className="flex-1 text-center">Requestor Head of Department</div>
                                    <div className="flex-1 text-center">Information Technology Manager</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-b-md text-black flex flex-col md:flex-row">
                                {/* Requested by */}
                                <div className="w-full md:flex-1 min-w-[250px] p-4 md:border-r border-gray-300">
                                    <label className="block text-base mb-1 font-bold text-black">Requested by</label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm flex items-center">
                                        {user?.name || formData.req_name || ''}
                                    </div>
                                </div>

                                {/* Acknowledge by */}
                                <div className="w-full md:flex-1 min-w-[250px] p-4 md:border-r border-gray-300">
                                    <label className="block text-base font-bold mb-1 text-black">Acknowledge by</label>
                                    <input
                                        type="text"
                                        placeholder="-- Select --"
                                        className="h-[36px] w-full px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm"
                                        disabled
                                    />
                                </div>

                                {/* Approved */}
                                <div className="w-full md:flex-1 min-w-[250px] p-4">
                                    <label className="block text-base font-bold mb-1 text-black">Approved</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        className="h-[36px] w-full px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-900 text-sm"
                                        disabled
                                    />
                                </div>
                            </div>


                            {/* Buttons */}
                            <div className="flex justify-between pt-6">
                                <Button
                                    leftSection={<IconArrowLeft size={18} />}
                                    color="gray"
                                    size="sm"
                                    onClick={() => router.back()}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    leftSection={<IconDeviceFloppy size={18} />}
                                    color="blue"
                                    radius="sm"
                                    size="sm"
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>

                    </form>
                </Paper>
            </div>
        </AuthLayout >
    )
} 