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
import { formatDate } from "@/lib/dateFormat";

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
        request_reason: '',
        approval_hod_by: '',
        approval_it_hod_by: '',
        approval_lead_it_by: '',
        department_name: '',
        position_name: '',
        project_name: '',
    });

    const [errors, setErrors] = React.useState({
        full_name: null,
        badge_no: null,
        email: null,
        project: null,
        department: null,
        request_reason: null,
    });

    const [projects, setProjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [hodSearch, setHodSearch] = useState('');
    const [hodOptions, setHodOptions] = useState([]);
    const [itManagerName, setItManagerName] = useState('');
    const [itManagerId, setItManagerId] = useState('');
    const [badgeOptions, setBadgeOptions] = useState([]);
    const [badgeLoading, setBadgeLoading] = useState(true);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // --- Fetch all necessary data on mount ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const badgeRes = await axios.get(`${API_URL}/iss_employee`, {
                    headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' },
                });
                const employees = Array.isArray(badgeRes.data) ? badgeRes.data : [badgeRes.data];
                const badgeList = employees.map(e => ({
                    value: String(e.badge_no || e.badge),
                    label: `${e.badge_no || e.badge} - ${e.full_name || e.name}`, // 👈 ubah ini!
                    full_name: e.full_name || e.name,
                    department_name: e.department_name || '',
                    position_name: e.position_name || '',
                    project_name: e.project_name || '',
                    department_id: e.department_id || '',
                    id_position: e.id_position || '',
                    project_id: e.project_id || '',
                }));

                const uniqueBadges = Array.from(new Map(badgeList.map(item => [item.value, item])).values());
                setBadgeOptions(uniqueBadges);

                // Fetch HOD & IT Manager
                const hodRes = await axios.get(`${API_URL}/api/user/search`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: { role: 'head_of_department' },
                });
                const activeUsers = hodRes.data.filter(u => u.status_user === 1);
                const hodList = activeUsers.map(u => ({
                    value: u.id_user.toString(),
                    label: `${u.badge_no} - ${u.full_name}`,
                }));
                setHodOptions(hodList);

                // IT Manager
                const itManager = activeUsers.find(u => u.full_name.toLowerCase() === 'wahyu hidayat');
                if (itManager) {
                    const label = `${itManager.badge_no} - ${itManager.full_name}`;
                    setItManagerName(label);
                    setItManagerId(itManager.id_user);
                    handleChange('approval_it_hod_by', itManager.id_user);
                }

                // Fetch Projects and Departments
                const [projRes, deptRes] = await Promise.all([
                    axios.get(`${API_URL}/portal_project`, {
                        headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' },
                    }),
                    axios.get(`${API_URL}/portal_department`, {
                        headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' },
                    }),
                ]);
                setProjects(Array.isArray(projRes.data) ? projRes.data : []);
                setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);

            } catch (err) {
                console.error('Failed to fetch initial data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [API_URL, user.token]);

    // --- Handle selecting badge (use pre-fetched data) ---
    const handleSelectBadge = (value) => {
        const selected = badgeOptions.find(b => b.value === value);
        if (!selected) return;

        setFormData(prev => ({
            ...prev,
            badge_no: selected.value,
            full_name: selected.full_name,
            department_name: selected.department_name,
            position_name: selected.position_name,
            project_name: selected.project_name,
            department: selected.department_id,
            position: selected.id_position,
            project: selected.project_id,
        }));
    };

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
            badge_no: Number(formData.badge_no),
            email: formData.email,
            request_type: 1,
            request_reason: formData.request_reason,
            request_status: 0,
            created_by: user.id,
            status_active: 1,
            project: { id: Number(formData.project) },
            department: { id_department: Number(formData.department) },
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
                    text: "Your account request has been successfully submitted.",
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
                                    <span>{formatDate(new Date())}</span>
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
                                <Autocomplete
                                    required
                                    label="Badge ID"
                                    placeholder="Input Badge Number"
                                    data={badgeOptions}
                                    value={formData.badge_no || ''}
                                    onChange={(value) => handleChange('badge_no', value)}
                                    onOptionSubmit={(value) => handleSelectBadge(value)}
                                />

                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Full Name</span>}
                                    placeholder="Input Name"
                                    value={formData.full_name}
                                    readOnly
                                />

                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Department</span>}
                                    placeholder="Input Department"
                                    value={formData.department_name || ''}
                                    readOnly
                                />
                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Position</span>}
                                    placeholder="Input Position"
                                    value={formData.position_name || ''}
                                    readOnly
                                />

                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Project</span>}
                                    placeholder="Input Project"
                                    value={formData.project_name || ''}
                                    readOnly
                                />

                                {/* Email (manual) */}
                                <TextInput
                                    required
                                    type="email"
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Email</span>}
                                    placeholder="example@company.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    error={errors.email}
                                />

                                <Textarea
                                    required
                                    label={<span className="font-medium text-sm">Purpose</span>}
                                    placeholder="Input Request Purpose"
                                    value={formData.request_reason}
                                    onChange={(e) => handleChange('request_reason', e.target.value)}
                                    minRows={3}
                                    error={errors.request_reason}
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
                                label={<span className="font-medium text-sm">Remarks (Optional)</span>}
                                placeholder="Input Remarks (Optional)"
                                minRows={3}
                            />
                        </div>

                        {/* Signature Section */}

                        <div className="space-y-2 mt-6">
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-2 text-base font-semibold text-white grid grid-cols-4 text-center">
                                    <div>Requestor Department</div>
                                    <div>Head of Department</div>
                                    <div>Lead IT</div>
                                    <div>Asst. IT Manager/IT Manager</div>
                                </div>
                            </div>

                            <div className="bg-white rounded-b-md text-black grid grid-cols-1 md:grid-cols-4 text-sm">
                                {/* Requestor Department */}
                                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">Requested By</label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {user?.name || ''}
                                    </div>
                                </div>

                                {/* Head of Department */}
                                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                    <Select
                                        label="Acknowledge By"
                                        placeholder="Select HOD..."
                                        searchable
                                        value={String(formData.approval_hod_by || '')}
                                        onChange={(val) => handleChange('approval_hod_by', val)}
                                        data={hodOptions.map(u => ({
                                            value: String(u.value),
                                            label: u.label
                                        }))}
                                        onDropdownOpen={async () => {
                                            const users = await fetchHodUsers();
                                            setHodOptions(users);
                                        }}
                                        classNames={{
                                            input: "h-[36px] bg-gray-100 border-gray-300 text-sm",
                                            label: "font-medium mb-1 text-gray-800 text-sm",
                                        }}
                                    />
                                </div>

                                {/* Lead IT */}
                                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                    <Select
                                        label="Approved By"
                                        placeholder="Select Lead IT..."
                                        searchable
                                    />
                                </div>

                                {/* Asst. IT Manager / IT Manager */}
                                <div className="p-3">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Approved By
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
                </Paper >
            </div >
        </AuthLayout >
    )
}