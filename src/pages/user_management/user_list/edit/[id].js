import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select, MultiSelect } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Swal from "sweetalert2";
import userList from "@/data/sidebar/UserList";

function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const API = useApi();
  const API_URL = API.API_URL;
  const { user } = useUser();

  const [formData, setFormData] = useState({
    full_name: "",
    badge_no: "",
    username: "",
    email: "",
    project_id: null,
    project_ids: [],
    dept_id: null,
    dept_ids: [],
    company_id: null,
    id_role: null,
    access_yard_company: [],
  });

  const [errors, setErrors] = useState({
    access_yard_company: null,
    project_ids: null,
    email: null,
    dept_ids: null,
  });

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [accessYardOptions, setAccessYardOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);

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
          axios.get(`${API_URL}/iss_dept`, {
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

        setDeptOptions(
          deptRes.data.map((d) => ({
            value: String(d.dept_id),
            label: d.dept,
          })),
        );

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

  useEffect(() => {
    if (!id) return;

    const fetchUserDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const u = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!u) {
          Swal.fire("Error", "User not found", "error");
          return;
        }

        setFormData({
          badge_no: u.badge_no ?? "",
          full_name: u.full_name ?? "",
          username: u.username ?? "",
          email: u.email ?? "",

          outside_access: String(u.outside_access ?? 1),
          portal_type: String(u.portal_type ?? 0),
          status_user: String(u.status_user ?? 1),

          dept_id: u.dept_id ? String(u.dept_id) : null,
          project_id: u.project_id ? String(u.project_id) : null,
          company_id: u.company_id ? String(u.company_id) : null,
          id_role: u.id_role ? String(u.id_role) : null,

          project_ids: u.project_ids?.map(String) ?? [],
          dept_ids: u.dept_ids?.map(String) ?? [],
          access_yard_company: u.access_yard_company?.map(String) ?? [],
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to fetch user data", "error");
      } finally {
        setLoadingData(false);
      }
    };

    fetchUserDetail();
  }, [id, API_URL, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.project_ids.length)
      newErrors.project_ids = "Additional project is required";
    if (!formData.access_yard_company.length)
      newErrors.access_yard_company = "Company Yard Access is required";
    if (!formData.dept_ids.length)
      newErrors.dept_ids = "Department is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const confirm = await Swal.fire({
      title: "Update User?",
      text: "Are you sure you want to update this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    const payload = {
      badge_no: Number(formData.badge_no),
      full_name: formData.full_name,
      username: formData.username,
      email: formData.email,
      dept_id: Number(formData.dept_id),
      dept_ids: formData.dept_ids.map(Number),
      project_id: Number(formData.project_id),
      project_ids: formData.project_ids.map(Number),
      company_id: Number(formData.company_id),
      id_role: Number(formData.id_role),
      access_yard_company: formData.access_yard_company,
      updated_by: user.id,
    };

    try {
      setLoadingSubmit(true);

      await axios.put(`${API_URL}/api/user/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "User successfully updated",
        timer: 1500,
        showConfirmButton: false,
      });

      router.back();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update user", "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingData) return null;

  return (
    <AuthLayout sidebarList={userList}>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white w-full overflow-hidden border border-gray-200 max-w-6xl mx-auto"
        >
          <div className="border-b py-6 text-center bg-white">
            <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-tight">
              Edit User Account
            </h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-4 md:p-6 space-y-4">
              <div className="bg-gray-50 p-6 rounded-md shadow-sm space-y-4">
                <div className="flex flex-col gap-4">
                  <TextInput
                    required
                    label="Badge ID"
                    placeholder="Input Badge ID"
                    value={formData.badge_no}
                    onChange={(e) => handleChange("badge_no", e.target.value)}
                  />

                  <TextInput
                    required
                    label="Full Name"
                    placeholder="Input Full Name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                  />

                  <TextInput
                    required
                    label="Username"
                    placeholder="Input Username"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                  />

                  <Select
                    required
                    searchable
                    label="Department"
                    placeholder="Select Department"
                    data={deptOptions}
                    value={formData.dept_id}
                    onChange={(value) => handleChange("dept_id", value)}
                  />

                  <MultiSelect
                    required
                    searchable
                    label="Department Alt"
                    placeholder="Select Departments"
                    data={deptOptions}
                    value={formData.dept_ids}
                    onChange={(value) => handleChange("dept_ids", value)}
                    error={errors.dept_ids}
                  />

                  <Select
                    required
                    searchable
                    label="Company"
                    placeholder="Select Company"
                    data={companyOptions}
                    value={formData.company_id}
                    onChange={(value) => handleChange("company_id", value)}
                  />

                  <MultiSelect
                    label="Company Yard Access"
                    searchable
                    placeholder="Select Company Yard"
                    data={accessYardOptions}
                    value={formData.access_yard_company}
                    onChange={(val) => handleChange("access_yard_company", val)}
                    error={errors.access_yard_company}
                  />

                  <Select
                    label="Outside Access"
                    required
                    data={[
                      { value: "1", label: "Enable" },
                      { value: "0", label: "Disabled" },
                    ]}
                    value={String(formData.outside_access)}
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
                    value={String(formData.portal_type)}
                    onChange={(value) => handleChange("portal_type", value)}
                  />

                  <Select
                    required
                    searchable
                    label="Project"
                    placeholder="Select Project"
                    data={projectOptions}
                    value={formData.project_id}
                    onChange={(value) => handleChange("project_id", value)}
                  />

                  <MultiSelect
                    searchable
                    clearable
                    label="Additional Projects"
                    placeholder="Select Additional Projects"
                    data={projectOptions}
                    error={errors.project_ids}
                    value={formData.project_ids}
                    onChange={(value) => handleChange("project_ids", value)}
                  />

                  <TextInput
                    required
                    type="email"
                    label="Email Address"
                    placeholder="example@company.com"
                    value={formData.email}
                    error={errors.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />

                  <Select
                    label="User Status"
                    required
                    data={[
                      { value: "1", label: "Active" },
                      { value: "0", label: "Inactive" },
                      { value: "2", label: "Locked" },
                    ]}
                    value={String(formData.status_user)}
                    onChange={(value) => handleChange("status_user", value)}
                  />

                  <Select
                    required
                    searchable
                    label="Role"
                    placeholder="Select role"
                    data={roleOptions}
                    value={formData.id_role}
                    onChange={(value) => handleChange("id_role", value)}
                  />
                </div>
              </div>
            </div>

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
                Update
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

EditUser.title = "Edit User";
export default EditUser;
