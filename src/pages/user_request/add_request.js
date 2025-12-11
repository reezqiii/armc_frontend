import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import { Button, Paper, TextInput, Textarea, Select, Autocomplete, MultiSelect } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconCalendar, IconChevronDown } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useUser from '@/store/useUser';
import useSwal from '@/hooks/useSwal';
import useApi from '@/hooks/useApi';
import Swal from "sweetalert2";
import { formatDateTime } from "@/lib/dateFormat";
import { useDebouncedValue } from '@mantine/hooks';

function CreateRequest() {
 
    const router = useRouter()
    const { showAlert } = useSwal()
    const API = useApi();
    const API_URL = API.API_URL;
    const { user } = useUser()

    const [formData, setFormData] = React.useState({
        created_by_name: user?.full_name || user?.name || '-',
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
        remarks: '',
        company: '',
        company_name: '',
        access_yard_company: [],
        access_nav_menu: [],
    });

    const [errors, setErrors] = React.useState({
        full_name: null,
        badge_no: null,
        email: null,
        project: null,
        department: null,
        request_reason: null,
    });

    const [loading, setLoading] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [hodOptions, setHodOptions] = useState([]);
    const [leadItOptions, setLeadItOptions] = useState([]);
    const [itManagerOptions, setItManagerOptions] = useState([]);
    const [badgeOptions, setBadgeOptions] = useState([]);
    const [badgeLoading, setBadgeLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [accessYardOptions, setAccessYardOptions] = useState([]);
    const [navMenuOptions, setNavMenuOptions] = useState([]);
    const [debouncedSearch] = useDebouncedValue(search, 300);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    useEffect(() => {
        if (!debouncedSearch) {
            setBadgeOptions([]);
            return;
        }

        const fetchBadges = async () => {
            setBadgeLoading(true);
            try {
                const res = await axios.get(`${API_URL}/iss_employee/search?badge=${debouncedSearch}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                const employees = Array.isArray(res.data) ? res.data : [res.data];
                setBadgeOptions(
                    employees.map(e => ({
                        value: String(e.badge_no || e.badge),
                        label: `${e.badge_no || e.badge} - ${e.full_name || e.name}`,
                        full_name: e.full_name || e.name,
                        department_name: e.dept || '',
                        position_name: e.design_desc || '',
                        project_name: e.project_desc || '',
                    }))
                );
            } catch (err) {
                console.error(err);
            } finally {
                setBadgeLoading(false);
            }
        };

        fetchBadges();
    }, [debouncedSearch]);

    useEffect(() => {
           console.log("Fetch initial data running...");
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [hodRes, companyRes, navMenuRes] = await Promise.all([
                    axios.get(`${API_URL}/requests/hods`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                    axios.get(`${API_URL}/portal_company/list`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                    axios.get(`${API_URL}/portal_nav_menu/list`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }),
                ]);
                setHodOptions(hodRes.data.map(u => ({
                    value: String(u.id_user),
                    label: `${u.badge_no} - ${u.full_name}`
                })));
                setAccessYardOptions(companyRes.data.map(c => ({
                    value: String(c.id_company),
                    label: c.company_name,
                })));
                setNavMenuOptions(navMenuRes.data.map(n => ({
                    value: String(n.id_application),
                    label: n.application_name,
                })));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleSelectBadge = async (value) => {
        try {
            const res = await axios.get(`${API_URL}/iss_employee/employee/${value}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setFormData(prev => ({
                ...prev,
                badge_no: value,
                full_name: res.data.name ?? '',
                department_name: res.data.department.dept ?? '',
                position_name: res.data.position?.design_desc ?? '',
                project_name: res.data.project.project_desc ?? '',
                company_name: res.data.company_name ?? res.data.company ?? '',
                company: res.data.id_company ?? '',
                department: res.data.department.dept_id ?? '',
                position: res.data.position?.design_id ?? '',
                project: res.data.project.project_id ?? '',
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setBadgeLoading(false);
        }
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

        if (!result.isConfirmed) {
            setLoadingSubmit(false);
            return;
        }

        const payload = {
            full_name: formData.full_name,
            badge_no: formData.badge_no ? Number(formData.badge_no) : undefined,
            email: formData.email,
            request_type: 1,
            request_reason: formData.request_reason,
            request_status: 0,
            remarks: formData.remarks,
            created_by: user.id,
            status_active: 1,
            project_id: Number(formData.project),
            dept_id: Number(formData.department),
            design_id: Number(formData.position),
            id_company: Number(formData.company),
            approval_hod_by: formData.approval_hod_by,
            approval_it_hod_by: formData.approval_it_hod_by,
            access_yard_company: formData.access_yard_company,
            access_nav_menu: formData.access_nav_menu,
        };

        try {
            const response = await axios.post(`${API_URL}/requests/create`, payload, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (response.status === 200 || response.status === 201) {
                const newRequest = response.data;

                setFormData(prev => ({
                    ...prev,
                    created_by: newRequest.created_by,
                    created_by_name: newRequest.created_by_name,
                    created_date: newRequest.created_date,
                }));

                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Your account request has been successfully submitted.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setFormData({
                    created_by_name: user?.full_name || user?.name || '-',
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
                    remarks: '',
                    company: '',
                    company_name: '',
                    access_yard_company: [],
                    access_nav_menu: [],
                });
            }
        } catch (error) {
            console.error(error.response?.data || error.message);
            Swal.fire({
                icon: "error",
                title: "Failed!",
                text: "Something went wrong when submitting your request.",
            });
        } finally {
            setLoadingSubmit(false);
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

                    <form onSubmit={handleSubmit}>
                        {/* Requestor Info */}
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block font-medium mb-1 text-gray-800 text-sm">
                                    Request Date <span className="text-red-500">*</span>
                                </label>
                                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-between text-sm">
                                    <span>
                                        {formData.created_date
                                            ? formatDateTime(formData.created_date)
                                            : formatDateTime(new Date())}
                                    </span>
                                    <IconCalendar size={16} className="text-gray-500" />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium mb-1 text-gray-800 text-sm">
                                    Requestor <span className="text-red-500">*</span>
                                </label>
                                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center text-sm">
                                    {formData?.created_by_name || '-'}
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
                                <Autocomplete
                                    required
                                    label="Badge ID"
                                    placeholder="Input Badge Number"
                                    value={formData.badge_no || ''}
                                    onChange={(value) => {
                                        handleChange('badge_no', value);
                                        setSearch(value);
                                    }}
                                    data={badgeOptions.map(b => ({ value: b.value, label: b.label }))}
                                    onOptionSubmit={(item) => handleSelectBadge(item)}
                                    filter={null}
                                    rightSection={badgeLoading ? <div className="animate-spin h-4 w-4 border-2 border-gray-400 rounded-full" /> : null}
                                    nothingFound="No employees found"
                                />

                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Full Name</span>}
                                    placeholder="Input Name"
                                    value={formData.full_name || ''}
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

                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Company</span>}
                                    placeholder="Input Company"
                                    value={formData.company_name || ''}
                                    readOnly
                                />

                                <MultiSelect
                                    required
                                    label="Access Yard Company"
                                    placeholder="Select Access Yard"
                                    data={accessYardOptions}
                                    value={formData.access_yard_company}
                                    onChange={(val) => handleChange('access_yard_company', val)}
                                    searchable
                                    clearable
                                    classNames={{
                                        input: "bg-gray-100 border-gray-300 text-sm rounded-md min-h-[42px]",
                                        label: "font-medium mb-1 text-gray-800 text-sm",
                                    }}
                                />

                                <MultiSelect
                                    required
                                    label="Application Access"
                                    placeholder="Select Application Access"
                                    data={navMenuOptions}
                                    value={formData.access_nav_menu}
                                    onChange={(val) => handleChange('access_nav_menu', val)}
                                    searchable
                                    clearable
                                    classNames={{
                                        input: "bg-gray-100 border-gray-300 text-sm rounded-md min-h-[42px]",
                                        label: "font-medium mb-1 text-gray-800 text-sm",
                                    }}
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
                                <div className="px-10 py-3 mb-4 text-base font-semibold text-white">
                                    Remarks
                                </div>
                            </div>

                            <Textarea
                                label={<span className="font-medium text-sm">Remarks (Optional)</span>}
                                placeholder="Input Remarks (Optional)"
                                minRows={3}
                                value={formData.remarks}
                                onChange={(e) => handleChange('remarks', e.target.value)}
                            />
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

                            <div className="bg-white rounded-b-md text-black grid grid-cols-1 md:grid-cols-4 text-sm">
                                {/* Requestor Department */}
                                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">Requested By</label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {formData?.created_by_name || '-'}
                                    </div>
                                </div>

                                {/* HOD Requestor */}
                                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                    <Select
                                        key={formData.approval_hod_by}
                                        label="Acknowledge By"
                                        placeholder="Select HOD..."
                                        searchable
                                        value={formData.approval_hod_by || ''}
                                        onChange={(val) => handleChange('approval_hod_by', val)}
                                        data={hodOptions.map((u) => ({
                                            value: u.value,
                                            label: u.label
                                        }))}
                                        classNames={{
                                            input: "h-[36px] bg-gray-100 border-gray-300 text-sm",
                                            label: "font-medium mb-1 text-gray-800 text-sm",
                                        }}
                                    />
                                </div>

                                {/* Lead IT */}
                                <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Checked By
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {/* {leadItName || 'Loading...'} */}
                                    </div>
                                </div>

                                {/* Asst. IT Manager / IT Manager */}
                                <div className="p-3">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Approved By
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {/* {itManagerName || 'Loading...'} */}
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

CreateRequest.title = "Create Request Form";
export default CreateRequest;
