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
  IconChevronDown,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";
import { useDebouncedValue } from "@mantine/hooks";
import { formatDate } from "@/lib/dateFormat";

function CreateUser() {
  const router = useRouter();
  const { showAlert } = useSwal();
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();
  const [formData, setFormData] = React.useState({
    created_by_name: user?.full_name || user?.name || "-",
    full_name: "",
    badge_no: "",
    email: "",
    project: "",
    department: "",
    request_reason: "",
    approval_hod_by: "",
    approval_it_hod_by: "",
    approval_lead_it_by: "",
    department_name: "",
    position_name: "",
    project_name: "",
    remarks: "",
    company: "",
    company_name: "",
    category_account: "",
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
  const [search, setSearch] = useState("");
  const [accessYardOptions, setAccessYardOptions] = useState([]);
  const [navMenuOptions, setNavMenuOptions] = useState([]);
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const CATEGORY_ACCOUNT_OPTIONS = [
    { value: "0", label: "Create New Account" },
    { value: "1", label: "Request Permission" },
    { value: "2", label: "Request Outside Access" },
  ];
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
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
        const res = await axios.get(
          `${API_URL}/iss_employee/search?badge=${debouncedSearch}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );
        const employees = Array.isArray(res.data) ? res.data : [res.data];
        setBadgeOptions(
          employees.map((e) => ({
            value: String(e.badge_no || e.badge),
            label: `${e.badge_no || e.badge} - ${e.full_name || e.name}`,
            full_name: e.full_name || e.name,
            department_name: e.dept || "",
            position_name: e.design_desc || "",
            project_name: e.project_desc || "",
          })),
        );
      } catch (err) {
        console.error(err);
      } finally {
        setBadgeLoading(false);
      }
    };

    fetchBadges();
  }, [API_URL, debouncedSearch, user.token]);

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
        setHodOptions(
          hodRes.data.map((u) => ({
            value: String(u.id_user),
            label: `${u.badge_no} - ${u.full_name}`,
          })),
        );
        setAccessYardOptions(
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [API_URL, user.token]);

  const handleSelectBadge = async (value) => {
    try {
      const res = await axios.get(`${API_URL}/iss_employee/employee/${value}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFormData((prev) => ({
        ...prev,
        badge_no: value,
        full_name: res.data.name ?? "",
        department_name: res.data.department.dept ?? "",
        position_name: res.data.position?.design_desc ?? "",
        project_name: res.data.project.project_desc ?? "",
        company_name: res.data.company_name ?? res.data.company ?? "",
        company: res.data.id_company ?? "",
        department: res.data.department.dept_id ?? "",
        position: res.data.position?.design_id ?? "",
        project: res.data.project.project_id ?? "",
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

    if (
      !formData.access_yard_company ||
      formData.access_yard_company.length === 0
    ) {
      newErrors.access_yard_company = "Company Yard Access is required";
    }

    if (!formData.access_nav_menu || formData.access_nav_menu.length === 0) {
      newErrors.access_nav_menu = "Application Access is required";
    }

    if (!formData.approval_hod_by) {
      newErrors.approval_hod_by = "HOD must be selected";
    }

    if (!formData.category_account) {
      newErrors.category_account = "Category account is required";
    }

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
          created_by_name:
            newRequest.created_by_name || user?.full_name || user?.name || "-",
          created_date: newRequest.created_date || new Date(),
          created_by: newRequest.created_by || user?.id || "",
          full_name: "",
          badge_no: "",
          email: "",
          project: "",
          department: "",
          request_reason: "",
          approval_hod_by: "",
          approval_it_hod_by: "",
          approval_lead_it_by: "",
          department_name: "",
          position_name: "",
          project_name: "",
          remarks: "",
          company: "",
          company_name: "",
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
    <AuthLayout>
      <div className="bg-gray-100 min-h-screen py-6 px-4 md:px-6 w-full">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white w-full overflow-hidden border border-gray-200 max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="border-b py-4 text-center bg-white">
            <h1 className="text-xl md:text-2xl font-bold text-blue-600 uppercase tracking-tight">
              Create New User Account
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-4 md:p-6 space-y-4">
              {/* SECTION 1: Basic Info */}
              <div className="bg-gray-50 p-6 rounded-md shadow-sm space-y-4">
                <div className="flex flex-col gap-4">
                  <TextInput
                    label="Badge ID"
                    placeholder="Input Badge ID"
                    value={formData.badge_no}
                    onChange={(e) => handleChange("badge_no", e.target.value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <TextInput
                    label="Full Name"
                    placeholder="Input Full Name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />

                  <TextInput
                    label="Username"
                    placeholder="Input Username"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <Select
                    required
                    searchable
                    label="Department"
                    placeholder="Select Department"
                    // data={deptOptions}
                    value={formData.dept_id ?? null}
                    onChange={(value) => handleChange("dept_id", value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <Select
                    required
                    searchable
                    label="Project"
                    placeholder="Select Project"
                    // data={projectOptions}
                    value={formData.project_id ?? null}
                    onChange={(value) => handleChange("project_id", value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <Select
                    required
                    searchable
                    label="Company"
                    placeholder="Select Company"
                    // data={companyOptions}
                    value={formData.company_id ?? null}
                    onChange={(value) => handleChange("company_id", value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <TextInput
                    label="Email Address"
                    placeholder="example@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <MultiSelect
                    label="Company Yard Access"
                    placeholder="Select Company Yard"
                    data={accessYardOptions}
                    value={formData.access_yard_company}
                    onChange={(val) => handleChange("access_yard_company", val)}
                    error={errors.access_yard_company}
                    searchable
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: `min-h-[40px] ${
                        errors.access_yard_company ? "border-red-500" : ""
                      }`,
                    }}
                  />
                  <Select
                    label="Status User"
                    placeholder="Select Status"
                    data={[
                      { value: "activated", label: "Activated" },
                      { value: "deactivated", label: "Deactivated" },
                    ]}
                    value={formData.status_user}
                    onChange={(val) => handleChange("status_user", val)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <Select
                    label="Role ID"
                    placeholder="Select Role"
                    value={formData.role_id}
                    onChange={(val) => handleChange("role_id", val)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 px-6 pb-6">
              <Button
                leftSection={<IconArrowLeft size={18} />}
                color="gray"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={18} />}
                color="blue"
                loading={loadingSubmit}
                disabled={loadingSubmit}
              >
                Submit
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

CreateUser.title = "Create User";
export default CreateUser;
