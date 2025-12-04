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
import { formatDate } from "@/lib/dateFormat";
import { useDebouncedValue } from '@mantine/hooks';

function CreateRequest() {

    const router = useRouter()
    const { showAlert } = useSwal()
    const API = useApi();
    const API_URL = API.API_URL;
    const { user } = useUser()

    const [formData, setFormData] = React.useState({
        full_name: '',
        badge_no: '',
        email: '',
        project_id: '',
        dept_id: '',
        design_id: '',
        company_id: '',
        request_reason: '',
        remarks: '',
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
    const [search, setSearch] = useState('');
    const [accessYardOptions, setAccessYardOptions] = useState([]);
    const [navMenuOptions, setNavMenuOptions] = useState([]);
    const [debouncedSearch] = useDebouncedValue(search, 300);
    const [deptOptions, setDeptOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [companyOptions, setCompanyOptions] = useState([]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [companyRes, navMenuRes] = await Promise.all([
                    axios.get(`${API_URL}/portal_company/list`),
                    axios.get(`${API_URL}/portal_nav_menu/list`)
                ]);
                // Access Yard
                setAccessYardOptions(companyRes.data.map(c => ({
                    value: String(c.id_company),
                    label: c.company_name,
                })));

                // Application Access
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
    }, [API_URL, user.token]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, posRes, projectRes, companyRes] = await Promise.all([
                    axios.get(`${API_URL}/iss_dept`),
                    axios.get(`${API_URL}/position`),
                    axios.get(`${API_URL}/iss_project`),
                    axios.get(`${API_URL}/portal_company/list`)
                ]);

                // Format Department
                const deptOptions = deptRes.data.map(item => ({
                    value: String(item.dept_id),
                    label: item.dept
                }));

                // Format Position
                const positionOptions = posRes.data.map(item => ({
                    value: String(item.design_id),
                    label: item.design_desc
                }));

                // Format Project
                const projectOptions = projectRes.data.map(item => ({
                    value: String(item.project_id),
                    label: item.project_desc
                }));

                // Format Company
                const companyOptions = companyRes.data.map(item => ({
                    value: String(item.id_company),
                    label: item.company_name,
                }));

                setDeptOptions(deptOptions);
                setPositionOptions(positionOptions);
                setProjectOptions(projectOptions);
                setCompanyOptions(companyOptions);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, []);

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
            request_status: 3,
            remarks: formData.remarks,
            status_active: 1,
            project_id: Number(formData.project_id),
            dept_id: Number(formData.dept_id),
            design_id: Number(formData.design_id),
            id_company: Number(formData.company_id),
            approval_it_hod_by: formData.approval_it_hod_by,
            access_yard_company: formData.access_yard_company,
            access_nav_menu: formData.access_nav_menu,
        };

        try {
            const response = await axios.post(`${API_URL}/requests/public/create`, payload);

            if (response.status === 200 || response.status === 201) {
                const newRequest = response.data;

                setFormData(prev => ({
                    ...prev,
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
                                            ? formatDate(formData.created_date)
                                            : formatDate(new Date())}
                                    </span>
                                    <IconCalendar size={16} className="text-gray-500" />
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
                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Badge ID</span>}
                                    placeholder="Input Badge Number"
                                    value={formData.badge_no || ''}
                                    onChange={(e) => handleChange('badge_no', e.target.value)}
                                />

                                {/* Full Name */}
                                <TextInput
                                    required
                                    label={<span className="font-medium mb-1 text-gray-800 text-sm">Full Name</span>}
                                    placeholder="Input Name"
                                    value={formData.full_name || ''}
                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                />

                                {/* Department */}
                                <Select
                                    required
                                    searchable
                                    label="Department"
                                    placeholder="Select Department"
                                    data={deptOptions}
                                    value={formData.dept_id || ""}
                                    onChange={(value) => handleChange("dept_id", value)}
                                />

                                {/* Position */}
                                <Select
                                    required
                                    searchable
                                    label="Position"
                                    placeholder="Select Position"
                                    data={positionOptions}
                                    value={formData.design_id || ""}
                                    onChange={(value) => handleChange("design_id", value)}
                                />

                                {/* Project */}
                                <Select
                                    required
                                    searchable
                                    label="Project"
                                    placeholder="Select Project"
                                    data={projectOptions}
                                    value={formData.project_id || ""}
                                    onChange={(value) => handleChange("project_id", value)}
                                />

                                {/* Company */}
                                <Select
                                    required
                                    searchable
                                    label="Company"
                                    placeholder="Select Company"
                                    data={companyOptions}
                                    value={formData.company_id || ""}
                                    onChange={(value) => handleChange("company_id", value)}
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

                        <div className="space-y-2 mt-6">
                            <div className="-mx-10 bg-black shadow-sm">
                                <div className="px-10 py-3 text-base font-semibold text-white grid grid-cols-2 text-center">
                                    <div>Lead IT</div>
                                    <div>IT Manager</div>
                                </div>
                            </div>
                        </div>

                        {/* Signature Boxes */}
                        <div className="bg-white rounded-b-md text-black grid grid-cols-1 md:grid-cols-2 text-sm">

                            {/* Lead IT */}
                            <div className="p-3 border-b md:border-b-0 md:border-r border-gray-300">
                                <label className="font-medium mb-1 text-gray-800 text-sm">Checked By</label>
                                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center"></div>
                            </div>

                            {/* IT Manager */}
                            <div className="p-3">
                                <label className="font-medium mb-1 text-gray-800 text-sm">Approved By</label>
                                <div className="h-[36px] px-3 bg-gray-100 border border-gray-300 rounded-md flex items-center"></div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS - OUTSIDE GRID */}
                        <div className="w-full flex justify-between items-center pt-6">
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
                    </form>
                </Paper >
            </div >
        </AuthLayout >
    )
}

CreateRequest.title = "IT Request";
export default CreateRequest;
