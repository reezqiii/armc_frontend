import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  Select,
  MultiSelect,
  Checkbox,
  Badge,
  Loader,
  Text,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconShield,
  IconChevronDown,
  IconChevronUp,
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

function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();
  const { decrypt } = useDecrypt();
  const userId = id ? decrypt(id) : null;

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [rolePermissionIds, setRolePermissionIds] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const [formData, setFormData] = useState({
    full_name: "",
    badge_no: "",
    username: "",
    email: "",
    project_id: null,
    project_ids: [],
    department: null,
    id_role: null,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };
  useEffect(() => {
    if (!formData.id_role) {
      setRolePermissionIds([]);
      return;
    }

    const fetchRolePermissions = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/role-permission/${formData.id_role}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          },
        );
        setRolePermissionIds(
          data.filter((p) => p.assigned).map((p) => p.id_permission),
        );
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
        const [deptRes, projectRes, roleRes] = await Promise.all([
          axios.get(`${API_URL}/portal-department`, { headers }),
          axios.get(`${API_URL}/portal-project`, { headers }),
          axios.get(`${API_URL}/role`, { headers }),
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
            .filter((p) => p.id && p.project_name)
            .map((p) => ({ value: String(p.id), label: p.project_name })),
        );
        setRoleOptions(
          roleRes.data
            .filter((r) => r.id_role && r.role_name)
            .map((r) => ({ value: String(r.id_role), label: r.role_name })),
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
          project_id: data.project_id ? String(data.project_id) : null,
          project_ids: data.project_ids?.map(String) ?? [],
          department: data.dept_id ? String(data.dept_id) : null,
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
    if (!id || !userId) return;

    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const { data } = await axios.get(
          `${API_URL}/portal_user_permission/user/${userId}`,
          { headers: { Authorization: `Bearer ${user.token}` } },
        );
        setPermissions(data);
        setSelectedPermissionIds(
          data.filter((p) => p.assigned).map((p) => p.id_permission),
        );
      } catch (err) {
        console.error("Failed to fetch user permissions", err);
        showAlert("Error", "error", "Failed to load permissions.", "OK");
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, [id]);
  const grouped = permissions.reduce((acc, p) => {
    const group = p.permission_group ?? "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(p);
    return acc;
  }, {});

  const groupNames = Object.keys(grouped).sort();

  const toggleGroup = (group) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleAll = (groupPermissions) => {
    const groupIds = groupPermissions.map((p) => p.id_permission);
    const allSelected = groupIds.every((gid) =>
      selectedPermissionIds.includes(gid),
    );
    if (allSelected) {
      setSelectedPermissionIds((prev) =>
        prev.filter((pid) => !groupIds.includes(pid)),
      );
    } else {
      setSelectedPermissionIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const togglePermission = (id_permission) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id_permission)
        ? prev.filter((pid) => pid !== id_permission)
        : [...prev, id_permission],
    );
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full Name is required";
    if (!formData.badge_no) newErrors.badge_no = "Badge ID is required";
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.project_id) newErrors.project_id = "Project is required";
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

    const payload = {
      ...formData,
      department: Number(formData.department),
      project_id: Number(formData.project_id),
      project_ids: formData.project_ids?.map(Number) ?? [],
      id_role: Number(formData.id_role),
    };

    try {
      setLoadingSubmit(true);
      await axios.put(`${API_URL}/user/update/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await axios.post(
        `${API_URL}/portal_user_permission/user/${userId}/sync`,
        { permission_ids: selectedPermissionIds },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      await showAlert("Success", "success", "User successfully updated", "OK");
    } catch (err) {
      console.error(err);
      showAlert(
        "Error",
        "error",
        err.response?.data?.message || "Failed to update user",
        "OK",
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
                        value={formData.department}
                        onChange={(v) => handleChange("department", v)}
                        error={errors.department}
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

                {loadingPermissions ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader color="teal" size="sm" />
                    <Text size="sm" color="dimmed" ml="sm">
                      Loading permissions...
                    </Text>
                  </div>
                ) : (
                  <div className="p-4 space-y-2">
                    {groupNames.map((group) => {
                      const groupPerms = grouped[group];
                      const isCollapsed = collapsedGroups[group];
                      const groupIds = groupPerms.map((p) => p.id_permission);
                      const checkedCount = groupIds.filter(
                        (gid) =>
                          selectedPermissionIds.includes(gid) ||
                          rolePermissionIds.includes(gid),
                      ).length;

                      const allChecked = checkedCount === groupPerms.length;
                      const someChecked = checkedCount > 0 && !allChecked;
                      const handleToggleGroup = (e) => {
                        e.stopPropagation();
                        const availableIds = groupIds.filter(
                          (id) => !rolePermissionIds.includes(id),
                        );
                        if (availableIds.length === 0) return; // Jika semua permission dari role, abaikan

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

                      return (
                        <div
                          key={group}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Group Header */}
                          <div
                            className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleGroup(group)}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={allChecked}
                                indeterminate={someChecked}
                                onChange={handleToggleGroup} // Gunakan fungsi yang baru dibuat di atas
                                onClick={(e) => e.stopPropagation()}
                                color="teal"
                                size="sm"
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                {group}
                              </span>
                              <Badge
                                color={checkedCount > 0 ? "teal" : "gray"}
                                variant="light"
                                size="xs"
                              >
                                {checkedCount}/{groupPerms.length}
                              </Badge>
                            </div>
                            {isCollapsed ? (
                              <IconChevronDown
                                size={16}
                                className="text-gray-400"
                              />
                            ) : (
                              <IconChevronUp
                                size={16}
                                className="text-gray-400"
                              />
                            )}
                          </div>

                          {/* Permission Items */}
                          {!isCollapsed && (
                            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {groupPerms.map((p) => {
                                const isRolePerm = rolePermissionIds.includes(
                                  p.id_permission,
                                );
                                const isDirectPerm =
                                  selectedPermissionIds.includes(
                                    p.id_permission,
                                  );
                                const isChecked = isRolePerm || isDirectPerm;

                                return (
                                  <div
                                    key={p.id_permission}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                      isChecked
                                        ? "bg-teal-50 border border-teal-200"
                                        : "hover:bg-gray-50 border border-transparent"
                                    } ${
                                      isRolePerm
                                        ? "opacity-70 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                    onClick={() => {
                                      if (!isRolePerm)
                                        togglePermission(p.id_permission);
                                    }}
                                  >
                                    <Checkbox
                                      checked={isChecked}
                                      disabled={isRolePerm} // 4. Disable checkbox bawaan role
                                      onChange={() => {
                                        if (!isRolePerm)
                                          togglePermission(p.id_permission);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      color="teal"
                                      size="sm"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm text-gray-700 font-medium">
                                          {p.permission_name}
                                        </p>
                                        {/* 5. Tampilkan indikator visual bahwa ini milik Role */}
                                        {isRolePerm && (
                                          <Badge
                                            color="gray"
                                            variant="outline"
                                            size="xs"
                                            style={{ textTransform: "none" }}
                                          >
                                            Role
                                          </Badge>
                                        )}
                                      </div>
                                      {p.index_key && (
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                                          {p.index_key}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {groupNames.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No permissions available
                      </div>
                    )}
                  </div>
                )}
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
