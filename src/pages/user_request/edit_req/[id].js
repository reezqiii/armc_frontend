import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import { Button, Paper, TextInput, Textarea, Select, Autocomplete, MultiSelect } from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconCalendar } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import useUser from '@/store/useUser';
import useSwal from '@/hooks/useSwal';
import useApi from '@/hooks/useApi';
import useDecrypt from '@/hooks/useDecrypt';
import useEncrypt from '@/hooks/useEncrypt';
import Swal from "sweetalert2";
import { formatDateTime } from "@/lib/dateFormat";
import { useDebouncedValue } from '@mantine/hooks';

function EditRequest() {
    const router = useRouter()
    const { id } = router.query;
    const { showAlert } = useSwal()
    const API = useApi()
    const API_URL = API.API_URL
    const { user } = useUser()
    const { encrypt } = useEncrypt();
    const { decrypt } = useDecrypt();

    const [formData, setFormData] = useState({
        created_by_name: user?.full_name || user?.name || '-',
        full_name: '',
        badge_no: '',
        email: '',
        project: '',
        department: '',
        request_reason: '',
        approval_hod_by: '',
        approval_it_hod_by: '',
        remarks: '',
        request_status: 0,
        company: '',
        company_name: '',
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [loadingSubmit, setLoadingSubmit] = useState(false)
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [badgeOptions, setBadgeOptions] = useState([]);
    const [badgeLoading, setBadgeLoading] = useState(false);
    const [hodOptions, setHodOptions] = useState([]);
    const [accessYardOptions, setAccessYardOptions] = useState([]);
    const [navMenuOptions, setNavMenuOptions] = useState([]);
    const isReturned = formData.request_status === 8;

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
                    label: `${u.badge_no} - ${u.full_name}`,
                })));

                setAccessYardOptions(companyRes.data.map(c => ({
                    value: String(c.id_company),
                    label: c.company_name,
                })));

                setNavMenuOptions(navMenuRes.data.map(n => ({
                    value: String(n.id_application),
                    label: n.application_name,
                })));

                if (id) {
                    const res = await axios.get(`${API_URL}/requests/${id}`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });

                    const data = res.data;

                    setFormData(prev => ({
                        ...prev,
                        full_name: data.full_name || '',
                        badge_no: data.badge_no || '',
                        email: data.email || '',
                        request_reason: data.request_reason || '',
                        remarks: data.remarks || '',
                        approval_hod_by: data.approval_hod_by?.id_user ? String(data.approval_hod_by.id_user) : '',
                        approval_lead_it_by_name: data.approval_lead_it_by?.full_name || '-',
                        approval_it_hod_by_name: data.approval_it_hod_by?.full_name || '-',
                        company: data.company?.id_company ? String(data.company.id_company) : '',
                        department: data.dept_id ? String(data.dept_id) : '',
                        project: data.project_id ? String(data.project_id) : '',
                        project_name: data.project_name,
                        department_name: data.department_name,
                        position: data.design_id ? String(data.design_id) : '',
                        position_name: data.position_name ?? data.position ?? '',

                        company_name: data.company?.company_name || '',

                        approval_hod_by: data.approval_hod_by?.id
                            ? String(data.approval_hod_by.id)
                            : '',

                        access_nav_menu: Array.isArray(data.access_nav_menu)
                            ? data.access_nav_menu.map(item => String(item.id))
                            : [],

                        access_yard_company: Array.isArray(data.access_yard_company)
                            ? data.access_yard_company.map(item => String(item.id))
                            : [],
                    }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [id]);

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
                company_name: res.data.company_name ?? '',
                company: res.data.company ?? '',
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

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
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
            // request_status: formData.request_status,
            status_active: 1,
            remarks: formData.remarks,
            project_id: Number(formData.project),
            dept_id: Number(formData.department),
            design_id: Number(formData.position),
            id_company: Number(formData.company),
            access_yard_company: Array.isArray(formData.access_yard_company)
                ? formData.access_yard_company.join(',')
                : formData.access_yard_company || '',
            access_nav_menu: Array.isArray(formData.access_nav_menu)
                ? formData.access_nav_menu.join(',')
                : formData.access_nav_menu || '',
        };
        payload.approval_hod_by = formData.approval_hod_by
            ? { id: Number(formData.approval_hod_by) }
            : null;

        try {
            if (id) {
                await axios.put(`${API_URL}/requests/${id}`, payload, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });

                await Swal.fire({
                    icon: "success",
                    title: "Successful!",
                    text: "The data has been updated successfully.",
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

            router.replace(router.asPath);
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
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="font-medium mb-1 text-gray-800 text-sm">
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
                                <label className="font-medium mb-1 text-gray-800 text-sm">
                                    Requestor <span className="text-red-500">*</span>
                                </label>
                                <div className="h-[40px] px-3 bg-gray-100 border border-gray-300 rounded-md text-sm flex items-center">
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
                                    label="Full Name"
                                    value={formData.full_name || ''}
                                    readOnly
                                    classNames={{ input: "bg-gray-100 border-gray-300 text-sm" }}
                                />

                                <TextInput
                                    required
                                    label="Department"
                                    value={formData.department_name || ''}
                                    readOnly
                                    classNames={{ input: "bg-gray-100 border-gray-300 text-sm" }}
                                />

                                <TextInput
                                    required
                                    label="Position"
                                    value={formData.position_name || ''}
                                    readOnly
                                    classNames={{ input: "bg-gray-100 border-gray-300 text-sm" }}
                                />

                                <TextInput
                                    required
                                    label="Project"
                                    value={formData.project_name || ''}
                                    readOnly
                                    classNames={{ input: "bg-gray-100 border-gray-300 text-sm" }}
                                />

                                <TextInput
                                    required
                                    label="Company"
                                    value={
                                        formData.company_name ||
                                        formData.company?.company_name ||
                                        ''
                                    }
                                    readOnly
                                    classNames={{ input: "bg-gray-100 border-gray-300 text-sm" }}
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
                                        disabled={!isReturned}
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
                                        {formData.approval_lead_it_by_name || '-'}
                                    </div>
                                </div>

                                {/* Asst. IT Manager / IT Manager */}
                                <div className="p-3">
                                    <label className="font-medium mb-1 text-gray-800 text-sm">
                                        Approved By
                                    </label>
                                    <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center">
                                        {formData.approval_it_hod_by_name || '-'}
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

EditRequest.title = "Edit Request Form";
export default EditRequest;