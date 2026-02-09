import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  Textarea,
  Select,
  Autocomplete,
  MultiSelect,
} from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";
import { useDebouncedValue } from "@mantine/hooks";
import { formatDate } from "@/lib/dateFormat";

function CreateUser() {
  const router = useRouter();
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();
  const [formData, setFormData] = React.useState({
    full_name: "",
    badge_no: "",
    username: "",
    email: "",
    outside_access: "1",
    portal_type: "0",
    status_user: "1",
    project_id: null,
    project_ids: [],
    dept_id: null,
    company_id: null,
    id_role: null,
    access_yard_company: [],
  });
  const [errors, setErrors] = React.useState({
    access_yard_company: null,
    project_ids: null,
    email: null,
  });
  const [loading, setLoading] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [search, setSearch] = useState("");
  const [accessYardOptions, setAccessYardOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [companyRes, deptRes, projectRes, roleRes] = await Promise.all([
          axios.get(`${API_URL}/portal_company/list`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_URL}/portal-department`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_URL}/portal-project`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          axios.get(`${API_URL}/role`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);

        setAccessYardOptions(
          companyRes.data.map((c) => ({
            value: String(c.id_company),
            label: c.company_name,
          })),
        );

        setCompanyOptions(
          companyRes.data.map((c) => ({
            value: String(c.id_company),
            label: c.company_name,
          })),
        );

        const uniqueDept = Array.from(
          new Map(
            deptRes.data.map((d) => [
              String(d.temp_iss_id), // key
              {
                value: String(d.temp_iss_id),
                label: d.name_of_department,
              },
            ]),
          ).values(),
        );

        setDeptOptions(uniqueDept);

        setProjectOptions(
          projectRes.data.map((p) => ({
            value: String(p.id),
            label: p.project_name,
          })),
        );

        setRoleOptions(
          roleRes.data.map((r) => ({
            value: String(r.id_role),
            label: r.role_name,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch master data", err);
      }
    };

    fetchMasterData();
  }, [API_URL, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.project_ids || formData.project_ids.length === 0) {
      newErrors.project_ids = "Additional project is required";
    }
    if (formData.access_yard_company.length === 0)
      newErrors.access_yard_company = "Company Yard Access is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // KONFIRMASI SEBELUM SUBMIT
    const confirm = await Swal.fire({
      title: "Create User?",
      text: "Are you sure you want to create this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, create",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    // Jika cancel
    if (!confirm.isConfirmed) return;

    const payload = {
      badge_no: Number(formData.badge_no),
      full_name: formData.full_name,
      username: formData.username,
      email: formData.email,

      department: Number(formData.department),

      project_id: Number(formData.project_id),
      project_ids: formData.project_ids?.map(Number) ?? [],
      company_id: Number(formData.company_id),
      id_role: Number(formData.id_role),

      outside_access: Number(formData.outside_access),
      portal_type: Number(formData.portal_type),
      status_user: Number(formData.status_user),

      access_yard_company: formData.access_yard_company?.map(Number) ?? [],
      created_by: user.id,
    };

    try {
      setLoadingSubmit(true);

      await axios.post(`${API_URL}/api/user/create`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User successfully created",
        timer: 1500,
        showConfirmButton: false,
      });

      setFormData({
        badge_no: "",
        full_name: "",
        username: "",
        email: "",
        department: null,
        project_id: null,
        company_id: null,
        id_role: null,
        access_yard_company: [],
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create user", "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white w-full overflow-hidden border border-gray-200 max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-tight">
              Create New User Account
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-4 md:p-6 space-y-4">
              {/* SECTION 1: Basic Info */}
              <div className="bg-gray-50 p-6 rounded-md shadow-sm space-y-4">
                <div className="flex flex-col gap-4">
                  <TextInput
                    required
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
                    required
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
                    required
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
                    data={deptOptions}
                    value={formData.department ?? null}
                    onChange={(value) => handleChange("department", value)}
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
                    data={companyOptions}
                    value={formData.company_id ?? null}
                    onChange={(value) => handleChange("company_id", value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <MultiSelect
                    label="Company Yard Access"
                    searchable
                    placeholder="Select Company Yard"
                    data={accessYardOptions}
                    value={formData.access_yard_company}
                    onChange={(val) => handleChange("access_yard_company", val)}
                    error={errors.access_yard_company}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: `min-h-[40px] ${
                        errors.access_yard_company ? "border-red-500" : ""
                      }`,
                    }}
                  />
                  <Select
                    label="Outside Access"
                    required
                    data={[
                      { value: "1", label: "Enable" },
                      { value: "0", label: "Disabled" },
                    ]}
                    value={formData.outside_access}
                    onChange={(value) => handleChange("outside_access", value)}
                  />
                  <Select
                    label="Portal Type"
                    required
                    data={[
                      { value: "0", label: "Portal Default" },
                      { value: "1", label: "Portal External" },
                      { value: "2", label: "All" },
                    ]}
                    value={formData.portal_type}
                    onChange={(value) => handleChange("portal_type", value)}
                  />

                  <Select
                    required
                    searchable
                    label="Project"
                    placeholder="Select Project"
                    data={projectOptions}
                    value={formData.project_id ?? null}
                    onChange={(value) => handleChange("project_id", value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <MultiSelect
                    searchable
                    clearable
                    label="Additional Projects"
                    placeholder="Select Additional Projects"
                    data={projectOptions}
                    error={errors.project_ids}
                    value={formData.project_ids ?? []}
                    onChange={(value) => handleChange("project_ids", value)}
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
                    error={errors.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                  <Select
                    label="User Status"
                    required
                    data={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                    ]}
                    value={formData.status_user}
                    onChange={(value) => handleChange("status_user", value)}
                  />
                  <Select
                    required
                    searchable
                    label="Role"
                    placeholder="Select role"
                    data={roleOptions}
                    value={formData.id_role ?? null}
                    onChange={(value) => handleChange("id_role", value)}
                    classNames={{
                      label: "font-semibold mb-1 text-gray-700",
                      input: "h-[40px]",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2 gap-4 px-6 pb-6">
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
