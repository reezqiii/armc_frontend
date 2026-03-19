import AuthLayout from "@/components/layout/authLayout";
import requestorList from "@/data/sidebar/RequestorList";
import {
  Button,
  Paper,
  TextInput,
  Textarea,
  Select,
  Autocomplete,
  MultiSelect,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconCalendar,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";
import { useDebouncedValue } from "@mantine/hooks";
import { formatDate } from "@/lib/dateFormat";

function CreateRequest() {
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [formData, setFormData] = React.useState({
    created_by_name: user?.full_name || user?.name || "-",
    full_name: "",
    badge_no: "",
    email: "",
    department: null,
    project: null,
    company: null,
    request_reason: "",
    approval_hod_by: "",
    remarks: "",
    category_account: "",
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
    approval_hod_by: null,
  });

  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [hodOptions, setHodOptions] = useState([]);
  const [badgeOptions, setBadgeOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [deptOptions, setDeptOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [navMenuOptions, setNavMenuOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const handleChange = (field, value) => {
    if (field === "category_account") {
      const cat = categoryOptions.find((c) => c.value === value);
      setSelectedCategory(cat);
      setFormData((prev) => ({
        ...prev,
        category_account: value,
      }));
      if (errors.category_account)
        setErrors((prev) => ({ ...prev, category_account: null }));
      return;
    }

    if (field === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        approval_hod_by: "",
      }));
      fetchHodsByDept(value);
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  // Fetch HOD dinamis by department
  const fetchHodsByDept = async (dept_id) => {
    if (!dept_id) {
      setHodOptions([]);
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/user/hods-by-dept/${dept_id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setHodOptions(
        res.data.map((u) => ({
          value: String(u.id_user),
          label: `${u.badge_no} - ${u.full_name}`,
        })),
      );
    } catch (err) {
      console.error(err);
      setHodOptions([]);
    }
  };

  // Fetch badge search
  useEffect(() => {
    if (!debouncedSearch) {
      setBadgeOptions([]);
      return;
    }
    const fetchBadges = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/iss_employee/search?badge=${debouncedSearch}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        const employees = Array.isArray(res.data) ? res.data : [res.data];
        setBadgeOptions(
          employees.map((e) => ({
            value: String(e.badge_no || e.badge),
            label: `${e.badge_no || e.badge} - ${e.full_name || e.name}`,
          })),
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchBadges();
  }, [API_URL, debouncedSearch, user.token]);

  // Fetch semua master data
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [deptRes, projectRes, companyRes, navMenuRes, categoryRes] =
          await Promise.all([
            axios.get(`${API_URL}/portal-department`, {
              headers: { Authorization: `Bearer ${user.token}` },
            }),
            axios.get(`${API_URL}/portal-project`, {
              headers: { Authorization: `Bearer ${user.token}` },
            }),
            axios.get(`${API_URL}/portal_company/list`, {
              headers: { Authorization: `Bearer ${user.token}` },
            }),
            axios.get(`${API_URL}/portal_nav_menu/list`, {
              headers: { Authorization: `Bearer ${user.token}` },
            }),
            axios.get(`${API_URL}/category-account`, {
              headers: { Authorization: `Bearer ${user.token}` },
            }),
          ]);

        setDeptOptions(
          deptRes.data.map((d) => ({
            value: String(d.id_department),
            label: d.name_of_department,
          })),
        );
        setProjectOptions(
          projectRes.data.map((p) => ({
            value: String(p.id),
            label: p.project_name,
          })),
        );
        setCompanyOptions(
          companyRes.data.map((c) => ({
            value: String(c.id_company),
            label: c.company_name,
          })),
        );
        setNavMenuOptions(
          navMenuRes.data.map((n) => ({
            value: String(n.id_application),
            label: n.application_name,
          })),
        );
        setCategoryOptions(
          categoryRes.data.map((c) => ({
            value: String(c.id),
            label: c.name,
            application_required: c.application_required,
          })),
        );
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchAllData();
  }, [API_URL, user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.category_account)
      newErrors.category_account = "Category account is required";
    if (!formData.approval_hod_by)
      newErrors.approval_hod_by = "HOD must be selected";
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.request_reason)
      newErrors.request_reason = "Purpose is required";
    if (!formData.access_nav_menu?.length)
      newErrors.access_nav_menu = "Application Access is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await Swal.fire({
      icon: "question",
      title: "Are you sure?",
      text: "Do you want to submit this request?",
      showCancelButton: true,
      confirmButtonText: "Yes, submit it!",
      cancelButtonText: "No, cancel",
    });
    if (!result.isConfirmed) return;

    setLoadingSubmit(true);

    const payload = {
      full_name: formData.full_name,
      badge_no: formData.badge_no ? String(formData.badge_no).trim() : null,
      email: formData.email,
      request_reason: formData.request_reason,
      request_status: 0,
      remarks: formData.remarks,
      status_active: 1,
      project_id: formData.project ? Number(formData.project) : undefined,
      dept_id: formData.department ? Number(formData.department) : undefined,
      id_company: formData.company ? Number(formData.company) : undefined,
      approval_hod_by: formData.approval_hod_by,
      access_nav_menu: formData.access_nav_menu,
      category_account: Number(formData.category_account),
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

        setFormData({
          created_by_name: user?.full_name || user?.name || "-",
          full_name: "",
          badge_no: "",
          email: "",
          project: null,
          department: null,
          request_reason: "",
          approval_hod_by: "",
          remarks: "",
          company: null,
          category_account: null,
          access_nav_menu: [],
        });
        setSelectedCategory(null);
        setHodOptions([]);
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
            <h1 className="text-2xl font-bold text-teal-600 uppercase tracking-tight">
              PCMS Access Login Request Form
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-10 space-y-10">
              {/* 1. DATE & REQUESTOR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 text-sm">
                    Request Date <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center justify-between text-sm text-gray-600">
                    {formatDate(new Date())}
                    <IconCalendar size={18} className="text-gray-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-gray-700 text-sm">
                    Requestor <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[40px] px-4 bg-gray-50 border border-gray-300 rounded-md flex items-center text-sm text-gray-600 font-medium">
                    {formData?.created_by_name || "-"}
                  </div>
                </div>
              </div>

              {/* 2. EMPLOYEE DESCRIPTION */}
              <div className="space-y-6">
                <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                  <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                    Employee Description
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Select
                    required
                    label="Category Account"
                    placeholder="Select Category"
                    data={categoryOptions}
                    value={formData.category_account}
                    onChange={(value) =>
                      handleChange("category_account", value)
                    }
                    error={errors.category_account}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  {/* Badge — hanya search & display, tidak ada auto-fill */}
                  <Autocomplete
                    required
                    label="Badge ID"
                    placeholder="Search Badge Number"
                    value={formData.badge_no || ""}
                    onChange={(value) => {
                      handleChange("badge_no", value);
                      setSearch(value);
                    }}
                    data={badgeOptions.map((b) => b.label)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    label="Full Name"
                    placeholder="Input Full Name"
                    value={formData.full_name || ""}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    error={errors.full_name}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <Select
                    required
                    label="Department"
                    placeholder="Select Department"
                    data={deptOptions}
                    value={formData.department}
                    onChange={(val) => handleChange("department", val)}
                    error={errors.department}
                    searchable
                    classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                  />

                  <Select
                    required
                    label="Project"
                    placeholder="Select Project"
                    data={projectOptions}
                    value={formData.project}
                    onChange={(val) => handleChange("project", val)}
                    error={errors.project}
                    searchable
                    classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                  />

                  <Select
                    required
                    label="Company"
                    placeholder="Select Company"
                    data={companyOptions}
                    value={formData.company}
                    onChange={(val) => handleChange("company", val)}
                    searchable
                    classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                  />

                  <MultiSelect
                    required
                    error={errors.access_nav_menu}
                    label="Application Access"
                    placeholder="Select Application Access"
                    data={navMenuOptions}
                    value={formData.access_nav_menu}
                    onChange={(val) => {
                      handleChange("access_nav_menu", val);
                      if (val.length > 0)
                        setErrors((prev) => ({
                          ...prev,
                          access_nav_menu: null,
                        }));
                    }}
                    searchable
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "min-h-[40px]",
                    }}
                  />

                  <TextInput
                    required
                    type="email"
                    label="Email Address"
                    placeholder="example@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                </div>
              </div>

              {/* 3. PURPOSE & REMARKS */}
              <div className="space-y-4">
                <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                  <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                    Purpose & Remarks
                  </div>
                </div>
                <Textarea
                  required
                  label="Purpose of Request"
                  placeholder="Explain why you need access..."
                  value={formData.request_reason}
                  onChange={(e) =>
                    handleChange("request_reason", e.target.value)
                  }
                  minRows={3}
                  error={errors.request_reason}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
                <Textarea
                  label="Additional Remarks (Optional)"
                  placeholder="Input any other information..."
                  minRows={2}
                  value={formData.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
              </div>

              {/* 4. APPROVAL WORKFLOW */}
              <div className="space-y-4">
                <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm mb-8">
                  <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>Requestor</div>
                      <div>Head of Department</div>
                      <div>HOD IT</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-300 rounded-lg divide-y md:divide-y-0 md:divide-x divide-gray-300 overflow-hidden shadow-sm">
                  {/* Col 1 - Requestor */}
                  <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Requested By
                    </span>
                    <div className="text-sm font-bold text-gray-800 py-2 border-b border-gray-100">
                      {formData?.created_by_name || "-"}
                    </div>
                  </div>

                  {/* Col 2 - HOD dinamis by dept */}
                  <div className="p-4 bg-white flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Acknowledge By
                    </span>
                    <Select
                      error={errors.approval_hod_by}
                      placeholder={
                        formData.department
                          ? "Select HOD"
                          : "Select department first"
                      }
                      disabled={!formData.department}
                      searchable
                      value={formData.approval_hod_by}
                      onChange={(val) => handleChange("approval_hod_by", val)}
                      data={hodOptions}
                      variant="unstyled"
                      className="border-b border-gray-200"
                      classNames={{
                        input: "text-sm font-bold text-teal-600 h-auto p-0",
                      }}
                    />
                  </div>

                  {/* Col 3 - HOD IT */}
                  <div className="p-4 bg-gray-50/50 flex flex-col justify-between min-h-[120px]">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">
                      Approved By
                    </span>
                    <div className="text-sm font-medium text-gray-400 py-2 italic border-b border-dashed border-gray-200">
                      Waiting HOD IT Approval...
                    </div>
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
                  color="teal"
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
