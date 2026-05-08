import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  Select,
  MultiSelect,
  Badge,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconShield,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import useDecrypt from "@/hooks/useDecrypt";
import userList from "@/data/sidebar/UserList";
import Head from "next/head";
import PermissionManager from "@/components/common/PermissionManager";
import useEncrypt from "@/hooks/useEncrypt";

function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();
  const { decrypt } = useDecrypt();
  const { encrypt } = useEncrypt();

  const userId = id ? decrypt(id) : null;
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [rolePermissionIds, setRolePermissionIds] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [positionOptions, setPositionOptions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [formData, setFormData] = useState({
    full_name: "",
    badge_no: "",
    username: "",
    email: "",
    id_project: null,
    project_ids: [],
    id_department: null,
    id_position: null,
    id_role: null,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      if (field === "id_position") {
        const selectedPos = positionOptions.find((p) => p.value === value);
        if (selectedPos && selectedPos.roleId) {
          newData.id_role = String(selectedPos.roleId);
        }
      }
      return newData;
    });

    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  useEffect(() => {
    if (!formData.id_role) {
      setRolePermissionIds([]);
      return;
    }

    const fetchRolePermissions = async (roleId) => {
      if (
        !roleId ||
        roleId === "null" ||
        roleId === "undefined" ||
        roleId === lastFetchedRoleId.current
      ) {
        return;
      }

      try {
        lastFetchedRoleId.current = roleId;
        const encryptedRoleId = encrypt(String(roleId));

        if (!encryptedRoleId) return;

        const { data } = await axios.get(`${API_URL}/role/${encryptedRoleId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRolePermissionIds(data.permission_ids || []);
      } catch (err) {
        console.error("Failed to fetch role permissions", err);
      }
    };

    fetchRolePermissions();
  }, [formData.id_role, API_URL, user.token]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [deptRes, projectRes, roleRes, posRes] = await Promise.all([
          axios.get(`${API_URL}/portal-department`, { headers }),
          axios.get(`${API_URL}/portal-project`, { headers }),
          axios.get(`${API_URL}/role`, { headers }),
          axios.get(`${API_URL}/portal-position`, { headers }),
        ]);

        setDeptOptions(
          deptRes.data
            .filter((d) => d.id_department && d.name_of_department)
            .map((d) => ({
              value: String(d.id_department),
              label: d.name_of_department,
            })),
        );
        setProjectOptions(
          projectRes.data
            .filter((p) => p.id_project && p.project_name)
            .map((p) => ({
              value: String(p.id_project),
              label: p.project_name,
            })),
        );
        setRoleOptions(
          roleRes.data
            .filter((r) => r.id_role && r.role_name)
            .map((r) => ({ value: String(r.id_role), label: r.role_name })),
        );

        setPositionOptions(
          posRes.data.map((p) => ({
            value: String(p.id_position),
            label: p.position_name,
            roleId: p.id_role,
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

    const fetchUser = async () => {
      try {
        setLoadingData(true);
        const { data } = await axios.get(`${API_URL}/user/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setFormData({
          full_name: data.full_name ?? "",
          badge_no: data.badge_no ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          id_project: data.id_project ? String(data.id_project) : null,
          project_ids: data.addon_project ? data.addon_project.split(";") : [],
          id_department: data.id_department ? String(data.id_department) : null,
          id_position: data.id_position ? String(data.id_position) : null,
          id_role: data.id_role ? String(data.id_role) : null,
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
        showAlert("Error", "error", "Failed to load user data", "OK");
      } finally {
        setLoadingData(false);
      }
    };

    fetchUser();
  }, [id, API_URL, user.token]);

  useEffect(() => {
    if (!id) return;

    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/user/extra-permissions/${id}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        setPermissions(data);

        const directIds = data
          .filter(
            (p) =>
              p.assigned &&
              !rolePermissionIds.includes(Number(p.id_permission)),
          )
          .map((p) => Number(p.id_permission));

        setSelectedPermissionIds(directIds);
      } catch (err) {
        console.error("Failed to fetch user permissions", err);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [id, API_URL, user.token, rolePermissionIds]);

  const grouped = permissions.reduce((acc, p) => {
    const group = p.permission_group ?? "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  const groupNames = Object.keys(grouped).sort();

  const handleTogglePermission = (id_permission) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id_permission)
        ? prev.filter((pid) => pid !== id_permission)
        : [...prev, id_permission],
    );
  };

  const handleToggleGroup = (availableIds) => {
    const allAvailableSelected = availableIds.every((id) =>
      selectedPermissionIds.includes(id),
    );

    if (allAvailableSelected) {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !availableIds.includes(id)),
      );
    } else {
      setSelectedPermissionIds((prev) => [
        ...new Set([...prev, ...availableIds]),
      ]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.badge_no) newErrors.badge_no = "Badge ID is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.id_department)
      newErrors.id_department = "Department is required";
    if (!formData.id_project) newErrors.id_project = "Project is required";
    if (!formData.id_role) newErrors.id_role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const confirm = await showConfirm(
      "Update User?",
      "Are you sure you want to update this user account?",
      "Yes, Update!",
    );
    if (!confirm.isConfirmed) return;

    const addonProjectStr =
      formData.project_ids?.length > 0 ? formData.project_ids.join(";") : null;
    const payload = {
      full_name: formData.full_name,
      badge_no: formData.badge_no,
      username: formData.username,
      email: formData.email,
      id_department: Number(formData.id_department),
      id_project: Number(formData.id_project),
      id_role: Number(formData.id_role),
      id_position: formData.id_position ? Number(formData.id_position) : null,
      addon_project: addonProjectStr,
    };

    try {
      setLoadingSubmit(true);

      await Promise.all([
        axios.put(`${API_URL}/user/update/${id}`, payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axios.put(
          `${API_URL}/user/extra-permissions/${id}`,
          { permission_keys: selectedPermissionIds },
          { headers: { Authorization: `Bearer ${user.token}` } },
        ),
      ]);

      const allActiveIds = new Set([
        ...rolePermissionIds,
        ...selectedPermissionIds,
      ]);

      const activePermissionNames = permissions
        .filter((p) => allActiveIds.has(p.id_permission))
        .map((p) => `<li>${p.permission_name}</li>`)
        .join("");

      await showAlert(
        "User Updated Successfully!",
        "success",
        `
        <div style="text-align: left; font-size: 14px;">
          <p>The account for <b>${formData.full_name}</b> has been updated.</p>
          <hr />
          <p><b>Total Effective Permissions:</b></p>
          <ul style="max-height: 200px; overflow-y: auto; padding-left: 20px;">
            ${activePermissionNames || "<li>No permissions assigned</li>"}
          </ul>
        </div>
        `,
        "Finish",
      );

      router.push("/user_management/user_list/list");
    } catch (err) {
      console.error(err);
      showAlert(
        "Update Failed",
        "error",
        err.response?.data?.message || "Something went wrong",
        "Close",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  const inputClass = { label: "font-semibold mb-1 text-gray-700" };

  if (loadingData) {
    return (
      <AuthLayout sidebarList={userList}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading user data...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit User | ARMC</title>
      </Head>
      <AuthLayout sidebarList={userList}>
        <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8 w-full">
          <form onSubmit={handleSubmit}>
            <div className="max-w-5xl mx-auto space-y-4">
              {/* ── User Info Card ── */}
              <Paper
                radius="md"
                shadow="md"
                className="bg-white w-full overflow-hidden border border-gray-200"
              >
                {/* Header */}
                <div className="border-b py-6 text-center bg-white">
                  <h1 className="text-2xl font-bold text-teal-600 uppercase tracking-tight">
                    Edit User Account
                  </h1>
                  <p className="text-xs text-gray-400 mt-1">
                    Update user information and direct permissions
                  </p>
                </div>

                <div className="p-6 md:p-10 space-y-10">
                  {/* BASIC INFORMATION */}
                  <div className="space-y-4">
                    <div className="-mx-6 md:-mx-10 bg-teal-600 shadow-sm">
                      <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
                        Basic Information
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextInput
                        required
                        label="Badge ID"
                        placeholder="Input Badge ID"
                        value={formData.badge_no}
                        onChange={(e) =>
                          handleChange("badge_no", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleChange("username", e.target.value)
                        }
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
                        value={formData.id_department}
                        onChange={(v) => handleChange("id_department", v)}
                        error={errors.id_department}
                        classNames={inputClass}
                      />
                      {/* KOMPONEN POSITION YANG BARU DITAMBAHKAN */}
                      <Select
                        required
                        searchable
                        label="Position"
                        placeholder="Select Position"
                        data={positionOptions}
                        value={formData.id_position}
                        onChange={(v) => handleChange("id_position", v)}
                        error={errors.id_position}
                        classNames={inputClass}
                      />
                      <Select
                        required
                        searchable
                        label="Project"
                        placeholder="Select Project"
                        data={projectOptions}
                        value={formData.id_project}
                        onChange={(v) => handleChange("id_project", v)}
                        error={errors.id_project}
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
              </Paper>

              {/* ── Direct Permissions Card ── */}
              <Paper
                radius="md"
                shadow="md"
                className="bg-white border border-gray-200"
              >
                <div className="border-b py-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconShield size={18} className="text-teal-600" />
                    <div>
                      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        Direct Permissions
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Permission tambahan di luar role yang dimiliki user ini
                      </p>
                    </div>
                  </div>
                  <Badge color="teal" variant="light" size="sm">
                    {selectedPermissionIds.length} selected
                  </Badge>
                </div>

                {/* Panggil komponennya di sini! */}
                <PermissionManager
                  permissions={permissions}
                  selectedIds={selectedPermissionIds}
                  inheritedIds={rolePermissionIds}
                  onTogglePermission={handleTogglePermission}
                  onToggleGroup={handleToggleGroup}
                  loading={loadingPermissions}
                />
              </Paper>

              {/* ── Action Buttons ── */}
              <div className="flex justify-between pb-6">
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
                  Update User
                </Button>
              </div>
            </div>
          </form>
        </div>
      </AuthLayout>
    </>
  );
}

EditUser.title = "Edit User";
export default EditUser;
