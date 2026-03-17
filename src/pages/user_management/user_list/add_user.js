import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  Select,
  MultiSelect,
  Divider,
} from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import userList from "@/data/sidebar/UserList";
import Head from "next/head";

function CreateUser() {
  const router = useRouter();
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [deptOptions, setDeptOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

  const [formData, setFormData] = useState({
    full_name: "",
    badge_no: "",
    username: "",
    email: "",
    outside_access: "1",
    portal_type: "0",
    status_user: "1",
    project_id: null,
    project_ids: [],
    department: null,
    company_id: null,
    id_role: null,
    access_yard_company: [],
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [companyRes, deptRes, projectRes, roleRes] = await Promise.all([
          axios.get(`${API_URL}/portal_company/list`, { headers }),
          axios.get(`${API_URL}/portal-department`, { headers }),
          axios.get(`${API_URL}/portal-project`, { headers }),
          axios.get(`${API_URL}/role`, { headers }),
        ]);

        // Company → id_company, company_name ✅
        setCompanyOptions(
          companyRes.data.map((c) => ({
            value: String(c.id_company),
            label: c.company_name,
          })),
        );

        // Department → id_department, name_department ✅ (bukan temp_iss_id & name_of_department)
        setDeptOptions(
          deptRes.data
            .filter((d) => d.id_department && d.name_of_department)
            .map((d) => ({
              value: String(d.id_department),
              label: d.name_of_department, // ← pakai name_of_department
            })),
        );
        // Project → id_project, project_name ✅ (bukan p.id)
        setProjectOptions(
          projectRes.data
            .filter((p) => p.id && p.project_name)
            .map((p) => ({
              value: String(p.id), // ← pakai p.id bukan p.id_project
              label: p.project_name,
            })),
        );

        // Role → id_role, role_name ✅
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

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.badge_no) newErrors.badge_no = "Badge ID is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.company_id) newErrors.company_id = "Company is required";
    if (!formData.project_id) newErrors.project_id = "Project is required";
    if (!formData.id_role) newErrors.id_role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const confirm = await showConfirm(
      "Create User?",
      "Are you sure you want to create this user account?",
      "Yes, Create!", // ← tambahkan parameter ke-3
    );
    if (!confirm.isConfirmed) return;

    const payload = {
      ...formData,
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
      await showAlert("Success", "success", "User successfully created", "OK");

      // Reset form
      setFormData({
        full_name: "",
        badge_no: "",
        username: "",
        email: "",
        outside_access: "1",
        portal_type: "0",
        status_user: "1",
        project_id: null,
        project_ids: [],
        department: null,
        company_id: null,
        id_role: null,
        access_yard_company: [],
      });
      setErrors({});
    } catch (err) {
      console.error(err);
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to create user",
        "OK",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const inputClass = { label: "font-semibold mb-1 text-gray-700" };

  return (
    <>
      <Head>
        <title>Create User | ARMC</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
          <Paper
            radius="md"
            shadow="md"
            className="bg-white w-full overflow-hidden border border-gray-200"
          >
            {/* Header */}
            <div className="border-b py-6 text-center bg-white">
              <h1 className="text-2xl font-bold text-teal-600 uppercase tracking-tight">
                Create New User Account
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 md:p-10 space-y-10">
                {/* BASIC INFORMATION */}
                <div className="space-y-4">
                  <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                    <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                      Basic Information
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    {/* ← ganti jadi 2 kolom */}
                    <TextInput
                      required
                      label="Badge ID"
                      placeholder="Input Badge ID"
                      value={formData.badge_no}
                      onChange={(e) => handleChange("badge_no", e.target.value)}
                      error={errors.badge_no}
                      classNames={inputClass}
                    />
                    <TextInput
                      required
                      label="Full Name"
                      placeholder="Input Full Name"
                      value={formData.full_name}
                      onChange={(e) =>
                        handleChange("full_name", e.target.value)
                      }
                      error={errors.full_name}
                      classNames={inputClass}
                    />
                    <TextInput
                      required
                      label="Username"
                      placeholder="Input Username"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      error={errors.username}
                      classNames={inputClass}
                    />
                    <TextInput
                      required
                      type="email"
                      label="Email Address"
                      placeholder="example@company.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      error={errors.email}
                      classNames={inputClass}
                    />
                  </div>
                </div>

                {/* ORGANIZATION */}
                <div className="space-y-4">
                  <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                    <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                      Organization
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Select
                      required
                      searchable
                      label="Department"
                      placeholder="Select Department"
                      data={deptOptions}
                      value={formData.department}
                      onChange={(v) => handleChange("department", v)}
                      error={errors.department}
                      classNames={inputClass}
                    />
                    <Select
                      required
                      searchable
                      label="Company"
                      placeholder="Select Company"
                      data={companyOptions}
                      value={formData.company_id}
                      onChange={(v) => handleChange("company_id", v)}
                      error={errors.company_id}
                      classNames={inputClass}
                    />
                    <Select
                      required
                      searchable
                      label="Project"
                      placeholder="Select Project"
                      data={projectOptions}
                      value={formData.project_id}
                      onChange={(v) => handleChange("project_id", v)}
                      error={errors.project_id}
                      classNames={inputClass}
                    />
                    <MultiSelect
                      searchable
                      clearable
                      label="Additional Projects"
                      placeholder="Select Additional Projects"
                      data={projectOptions}
                      value={formData.project_ids}
                      onChange={(v) => handleChange("project_ids", v)}
                      classNames={inputClass}
                    />
                    <Select
                      required
                      searchable
                      label="Role"
                      placeholder="Select Role"
                      data={roleOptions}
                      value={formData.id_role}
                      onChange={(v) => handleChange("id_role", v)}
                      error={errors.id_role}
                      classNames={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between px-6 md:px-10 pb-8 pt-2">
                <Button
                  leftSection={<IconArrowLeft size={16} />}
                  color="gray"
                  variant="light"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  leftSection={<IconDeviceFloppy size={16} />}
                  color="teal"
                  loading={loadingSubmit}
                  disabled={loadingSubmit}
                >
                  Save User
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      </AuthLayout>
    </>
  );
}

CreateUser.title = "Create User";
export default CreateUser;
