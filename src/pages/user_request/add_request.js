import AuthLayout from '@/components/layout/authLayout';
import { requestorList } from '@/data/sidebar/RequestorList';
import { Button, Paper, TextInput, Textarea, Select, Autocomplete } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconCalendar, IconChevronDown } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useUser from '@/store/useUser';
import useSwal from '@/hooks/useSwal';
import useApi from '@/hooks/useApi';
import Swal from "sweetalert2";

export default function CreateRequest() {
    CreateRequest.title = "Create Request Form"
    const router = useRouter()
    const { showAlert } = useSwal()
    const API = useApi();
    const API_URL = API.API_URL;
    const { user } = useUser()

    const [formData, setFormData] = React.useState({
        full_name: '',
        badge_no: '',
        email: '',
        project: '',
        department: '',
        role: '',
        request_reason: '',
        approval_hod_by: '',
        approval_it_hod_by: '',
    });

    const [errors, setErrors] = React.useState({
        full_name: null,
        badge_no: null,
        email: null,
        project: null,
        department: null,
        role: null,
        request_reason: null,
    });

    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [hodSearch, setHodSearch] = useState('');
    const [hodOptions, setHodOptions] = useState([]);
    const [itManagerName, setItManagerName] = useState('');
    const [itManagerId, setItManagerId] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    useEffect(() => {
        const loadItManager = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/user/search`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Cache-Control': 'no-cache'
                    },
                    params: { role: 'head_of_department' },
                });

                const activeUsers = res.data.filter(u => u.status_user === 1);

                const manager = activeUsers.find(u =>
                    u.full_name.toLowerCase() === 'wahyu hidayat'.toLowerCase()
                );

                if (manager) {
                    const label = `${manager.badge_no} - ${manager.full_name}`;
                    setItManagerName(label);
                    setItManagerId(manager.id_user);

                    handleChange('approval_it_hod_by', manager.id_user);
                }
            } catch (err) {
                console.error('Failed to fetch IT Manager:', err);
            }
        };

        loadItManager();
    }, []);

    const fetchHodUsers = async (query = '') => {
        try {
            const res = await axios.get(`${API_URL}/api/user/search`, {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { role: 'head_of_department', q: query },
            });

            const activeUsers = res.data.filter(u => u.status_user === 1);

            const mappedUsers = activeUsers.map(u => ({
                value: u.id_user.toString(),
                label: `${u.badge_no} - ${u.full_name}`,
            }));

            const uniqueUsers = Array.from(new Map(mappedUsers.map(u => [u.value, u])).values());
            return uniqueUsers;
        } catch (err) {
            console.error('Error fetching HOD users:', err);
            return [];
        }
    };

    // Fetch Dropdown   
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

                setProjects(Array.isArray(projRes.data) ? projRes.data : []);
                setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
                setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
            } catch (err) {
                console.error('Failed to fetch dropdown data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [API_URL, user.token]);

    // --- Handle Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);

        const result = await Swal.fire({
            title: "Ready to Submit?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Submit!",
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
            request_status: 0,
            created_by: user.id,
            status_active: 1,
            project: { id: Number(formData.project) },
            department: { id_department: Number(formData.department) },
            role: { id_role: Number(formData.role) },
            approval_hod_by: formData.approval_hod_by,
            approval_it_hod_by: formData.approval_it_hod_by,
        };

        try {
            const response = await axios.post(`${API_URL}/requests/create`, payload, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    timer: 1500,
                    showConfirmButton: false,
                });
                router.push('/user_request/requestor_list');
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            Swal.fire({
                icon: "error",
                title: "Failed!",
            });
        } finally {
            setLoadingSubmit(false);
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

                    <form onSubmit={handleSubmit}>
                        {/* Requestor Info */}
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block font-medium mb-1 text-gray-800 text-sm">
                                    Request Date <span className="text-red-500">*</span>
                                </label>
                                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-between text-sm">
                                    <span>{new Date().toLocaleDateString('en-US')}</span>
                                    <IconCalendar size={16} className="text-gray-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-gray-800 text-sm">
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
                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Full Name</span>}
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
                                    data={projects.map(p => ({ value: p.id?.toString(), label: p.project_name || 'Unnamed Project' }))}
                                    searchable
                                    value={formData.project}
                                    onChange={(v) => handleChange('project', v)}
                                    error={errors.project}
                                />

                                <Select
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Department</span>}
                                    placeholder="Select department..."
                                    data={departments.map(d => ({ value: d.id_department?.toString(), label: d.name_of_department || 'Unnamed Department' }))}
                                    searchable
                                    value={formData.department}
                                    onChange={(v) => handleChange('department', v)}
                                    error={errors.department}
                                />

                                <Select
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Role</span>}
                                    placeholder="Select role..."
                                    data={roles.map(r => ({ value: r.id_role?.toString(), label: r.role_name || 'Unnamed Role' }))}
                                    searchable
                                    value={formData.role}
                                    onChange={(v) => handleChange('role', v)}
                                    error={errors.role}
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

                            <Textarea
                                label={<span className="font-medium text-sm">Reason of Request</span>}
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
                                        Requested by
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {user?.name || ''}
                                    </div>
                                </div>

                                <div className="w-full md:flex-1 min-w-[250px] p-3 md:border-r border-gray-300">
                                    <Select
                                        label="Acknowledge by"
                                        placeholder="Select HOD..."
                                        searchable
                                        nothingFound="No HOD found"
                                        value={formData.approval_hod_by}
                                        onChange={(val) => handleChange('approval_hod_by', val)}
                                        data={hodOptions.map(u => ({ value: u.value, label: u.label }))}
                                        onDropdownOpen={async () => {
                                            const users = await fetchHodUsers(); // query kosong = ambil semua HOD
                                            setHodOptions(users);
                                        }}
                                        classNames={{
                                            input: "h-[36px] bg-gray-100 border-gray-300 text-sm",
                                            label: "font-medium mb-1 text-gray-800 text-sm",
                                        }}
                                    />

                                </div>

                                <div className="w-full md:flex-1 min-w-[250px] p-3">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Approved
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {itManagerName || 'Loading...'}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                                    loading={loadingSubmit}
                                    disabled={loadingSubmit}
                                >
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </form>
                </Paper>
            </div>
        </AuthLayout>
    )
}