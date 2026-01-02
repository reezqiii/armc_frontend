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
import { useDebouncedValue } from '@mantine/hooks';
import { formatDate } from '@/lib/dateFormat';

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
        category_account: '',
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
        category_account: null,
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
    const CATEGORY_ACCOUNT_OPTIONS = [
        { value: '0', label: 'Create New Account' },
        { value: '1', label: 'Request Permission' },
        { value: '2', label: 'Request Outside Access' },
    ];
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

        const newErrors = {};

        if (!formData.access_yard_company || formData.access_yard_company.length === 0) {
            newErrors.access_yard_company = 'Access Yard Company is required';
        }

        if (!formData.access_nav_menu || formData.access_nav_menu.length === 0) {
            newErrors.access_nav_menu = 'Application Access is required';
        }

        if (!formData.approval_hod_by) {
            newErrors.approval_hod_by = 'HOD must be selected';
        }

        if (!formData.category_account) {
            newErrors.category_account = 'Category account is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const result = await Swal.fire({
            icon: 'question',
            title: 'Are you sure?',
            text: 'Do you want to submit this request?',
            showCancelButton: true,
            confirmButtonText: 'Yes, submit it!',
            cancelButtonText: 'No, cancel',
        });

        if (!result.isConfirmed) return;

        setLoadingSubmit(true);

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
            category_account: Number(formData.category_account),
        };

        try {
            const response = await axios.post(`${API_URL}/requests/create`, payload, {
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (response.status === 200 || response.status === 201) {
                const newRequest = response.data;

                await Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Your account request has been successfully submitted.",
                    timer: 1500,
                    showConfirmButton: false,
                });

                setFormData({
                    created_by_name: newRequest.created_by_name || user?.full_name || user?.name || '-',
                    created_date: newRequest.created_date || new Date(),
                    created_by: newRequest.created_by || user?.id || '',
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
                    category_account: null,
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
            <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
                <Paper
                    radius="md"
                    shadow="md"
                    className="bg-white p-0 w-full overflow-hidden border border-gray-200"
                >
                    {/* Header */}
                    <div className="border-b py-6 text-center bg-white">
                        <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-tight">
                            PCMS Access Login Request
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 md:p-10 space-y-10">

                            {/* 1. INFORMASI DASAR (Date & Requestor) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="block font-semibold text-gray-700 text-sm">
                                        Request Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                                        {formatDate(formData.created_date || new Date())}
                                        <IconCalendar size={18} className="text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block font-semibold text-gray-700 text-sm">
                                        Requestor <span className="text-red-500">*</span>
                                    </label>
                                    <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                                        {formData?.created_by_name || '-'}
                                    </div>
                                </div>
                            </div>

                            {/* 2. DESCRIPTION SECTION */}
                            <div className="space-y-6">
                                <div className="-mx-6 md:-mx-10 bg-blue-600 shadow-sm">
                                    <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                                        Employee Description
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    {/* CATEGORY ACCOUNT */}
                                    <Select
                                        required
                                        label="Category Account"
                                        placeholder="Select Category"
                                        data={CATEGORY_ACCOUNT_OPTIONS}
                                        value={formData.category_account}
                                        onChange={(value) => {
                                            handleChange('category_account', value);
                                            if (value) {
                                                setErrors(prev => ({ ...prev, category_account: null }));
                                            }
                                        }}
                                        error={errors.category_account}
                                        classNames={{
                                            label: "font-semibold mb-1 text-gray-700",
                                            input: "h-[40px]"
                                        }}
                                    />

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
                                        nothingFound="No employees found"
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />

                                    <TextInput
                                        required
                                        label="Full Name"
                                        placeholder="Input Full Name"
                                        value={formData.full_name || ''}
                                        readOnly
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />

                                    <TextInput
                                        required
                                        label="Department"
                                        placeholder="Input Department"
                                        value={formData.department_name || ''}
                                        readOnly
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />

                                    <TextInput
                                        required
                                        label="Position"
                                        placeholder="Input Position"
                                        value={formData.position_name || ''}
                                        readOnly
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />

                                    <TextInput
                                        required
                                        label="Project"
                                        placeholder="Input Project"
                                        value={formData.project_name || ''}
                                        readOnly
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />

                                    <TextInput
                                        required
                                        label="Company"
                                        placeholder="Input Company"
                                        value={formData.company_name || ''}
                                        readOnly
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />

                                    <MultiSelect
                                        required
                                        error={errors.access_yard_company}
                                        label="Access Yard Company"
                                        placeholder="Select Yard"
                                        data={accessYardOptions}
                                        value={formData.access_yard_company}
                                        onChange={(val) => {
                                            handleChange('access_yard_company', val);
                                            if (val.length > 0) setErrors(prev => ({ ...prev, access_yard_company: null }));
                                        }}
                                        searchable
                                        classNames={{
                                            label: "font-semibold mb-1 text-gray-700",
                                            input: `min-h-[40px] ${errors.access_yard_company ? 'border-red-500' : ''}`
                                        }}
                                    />

                                    <MultiSelect
                                        required
                                        error={errors.access_nav_menu}
                                        label="Application Access"
                                        placeholder="Select Access"
                                        data={navMenuOptions}
                                        value={formData.access_nav_menu}
                                        onChange={(val) => {
                                            handleChange('access_nav_menu', val);
                                            if (val.length > 0) setErrors(prev => ({ ...prev, access_nav_menu: null }));
                                        }}
                                        searchable
                                        classNames={{
                                            label: "font-semibold mb-1 text-gray-700",
                                            input: `min-h-[40px] ${errors.access_nav_menu ? 'border-red-500' : ''}`
                                        }}
                                    />

                                    <TextInput
                                        required
                                        type="email"
                                        label="Email Address"
                                        placeholder="example@company.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        error={errors.email}
                                        classNames={{ label: "font-semibold mb-1 text-gray-700", input: "h-[40px]" }}
                                    />
                                </div>


                                {/* 3. REMARKS SECTION */}
                                <div className="space-y-4">
                                    <div className="-mx-6 md:-mx-10 bg-blue-600 shadow-sm">
                                        <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                                            Purpose & Remarks
                                        </div>
                                    </div>
                                    <Textarea
                                        required
                                        label="Purpose of Request"
                                        placeholder="Explain why you need access..."
                                        value={formData.request_reason}
                                        onChange={(e) => handleChange('request_reason', e.target.value)}
                                        minRows={3}
                                        error={errors.request_reason}
                                        classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                                    />

                                    <Textarea
                                        label="Additional Remarks (Optional)"
                                        placeholder="Input any other information..."
                                        minRows={2}
                                        value={formData.remarks}
                                        onChange={(e) => handleChange('remarks', e.target.value)}
                                        classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                                    />
                                </div>
                            </div>

                            {/* 4. APPROVAL WORKFLOW SECTION */}
                            <div className="space-y-4">
                                <div className="-mx-6 md:-mx-10 bg-blue-600 shadow-sm">
                                    <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                                        Approval Workflow
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-gray-300 rounded-lg divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden shadow-sm">
                                    {/* Col 1 */}
                                    <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Requested By</span>
                                        <div className="text-sm font-bold text-gray-800 py-2 border-b border-gray-100">
                                            {formData?.created_by_name || '-'}
                                        </div>
                                        <span className="text-[10px] text-gray-400 italic mt-1">Requestor</span>
                                    </div>

                                    {/* Col 2 */}
                                    <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Acknowledge By</span>
                                        <Select
                                            error={errors.approval_hod_by}
                                            placeholder="Select HOD Requestor"
                                            searchable
                                            value={formData.approval_hod_by || ''}
                                            onChange={(val) => handleChange('approval_hod_by', val)}
                                            data={hodOptions}
                                            variant="unstyled"
                                            className="border-b border-gray-200"
                                            classNames={{ input: "text-sm font-bold text-blue-600 h-auto p-0" }}
                                        />
                                        <span className="text-[10px] text-gray-400 italic mt-1">HOD Requestor</span>
                                    </div>

                                    {/* Col 3 */}
                                    <div className="p-4 bg-gray-50/50 flex flex-col justify-between min-h-[120px]">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Checked By</span>
                                        <div className="text-sm font-medium text-gray-400 py-2 italic border-b border-dashed border-gray-200">
                                            Waiting Lead IT Check...
                                        </div>
                                        <span className="text-[10px] text-gray-400 italic mt-1">Lead IT</span>
                                    </div>

                                    {/* Col 4 */}
                                    <div className="p-4 bg-gray-50/50 flex flex-col justify-between min-h-[120px]">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Approved By</span>
                                        <div className="text-sm font-medium text-gray-400 py-2 italic border-b border-dashed border-gray-200">
                                            Waiting IT Manager Check...
                                        </div>
                                        <span className="text-[10px] text-gray-400 italic mt-1">IT Manager</span>
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
    );
}

CreateRequest.title = "Create Request Form";
export default CreateRequest;
