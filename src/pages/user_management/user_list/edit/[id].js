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
import React, { useState, useEffect, useRef } from "react";
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
  const lastFetchedRoleId = useRef(null);

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
    if (!user || !user.token) return;

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
          deptRes.data.map((d) => ({
            value: String(d.id_department),
            label: d.name_of_department,
          })),
        );
        setProjectOptions(
          projectRes.data.map((p) => ({
            value: String(p.id_project),
            label: p.project_name,
          })),
        );
        setRoleOptions(
          roleRes.data.map((r) => ({
            value: String(r.id_role),
            label: r.role_name,
          })),
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
  }, [API_URL, user?.token]);

  useEffect(() => {
    if (!id || !user?.token) return;

    const initUserData = async () => {
      setLoadingData(true);
      setLoadingPermissions(true);

      try {
        const headers = { Authorization: `Bearer ${user.token}` };
        const [userRes, extraPermRes] = await Promise.all([
          axios.get(`${API_URL}/user/${id}`, { headers }),
          axios.get(`${API_URL}/user/extra-permissions/${id}`, { headers }),
        ]);

        const userData = userRes.data;
        const allPermissions = extraPermRes.data;

        const userOverrideIds = allPermissions
          .filter((p) => p.assigned)
          .map((p) => Number(p.id_permission));

        let defaultRoleIds = [];
        if (userData.id_role) {
          const encryptedRoleId = encrypt(String(userData.id_role));
          const roleRes = await axios.get(
            `${API_URL}/role/${encryptedRoleId}`,
            { headers },
          );
          defaultRoleIds = (roleRes.data.permission_ids || []).map(Number);
        }

        setPermissions(allPermissions);
        setRolePermissionIds(defaultRoleIds);

        const hasUserOverride = allPermissions.some((p) => p.assigned);

        if (hasUserOverride) {
          setSelectedPermissionIds(userOverrideIds);
        } else {
          setSelectedPermissionIds(defaultRoleIds);
        }

        setFormData({
          full_name: userData.full_name ?? "",
          badge_no: userData.badge_no ?? "",
          username: userData.username ?? "",
          email: userData.email ?? "",
          id_project: userData.id_project ? String(userData.id_project) : null,
          project_ids: userData.addon_project
            ? userData.addon_project.split(";")
            : [],
          id_department: userData.id_department
            ? String(userData.id_department)
            : null,
          id_position: userData.id_position
            ? String(userData.id_position)
            : null,
          id_role: userData.id_role ? String(userData.id_role) : null,
        });

        lastFetchedRoleId.current = String(userData.id_role);
      } catch (err) {
        console.error("Failed to init user data", err);
        showAlert("Error", "error", "Failed to load user data", "OK");
      } finally {
        setLoadingData(false);
        setLoadingPermissions(false);
      }
    };

    initUserData();
  }, [id, API_URL, user.token]);

  const handleTogglePermission = (id_permission) => {
    const idNum = Number(id_permission);
    setSelectedPermissionIds((prev) =>
      prev.includes(idNum) ? prev.filter((p) => p !== idNum) : [...prev, idNum],
    );
  };

  const handleToggleGroup = (availableIds) => {
    const ids = availableIds.map(Number);
    const allActive = ids.every((id) => selectedPermissionIds.includes(id));

    if (allActive) {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !ids.includes(id)),
      );
    } else {
      setSelectedPermissionIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Required";
    if (!formData.badge_no) newErrors.badge_no = "Required";
    if (!formData.username) newErrors.username = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.id_department) newErrors.id_department = "Required";
    if (!formData.id_position) newErrors.id_position = "Required";
    if (!formData.id_project) newErrors.id_project = "Required";
    if (!formData.id_role) newErrors.id_role = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const confirm = await showConfirm(
      "Update User?",
      "Save changes?",
      "Yes, Update!",
    );
    if (!confirm.isConfirmed) return;

    try {
      setLoadingSubmit(true);
      const finalIds = [...new Set(selectedPermissionIds.map(Number))];

      const payload = {
        full_name: formData.full_name,
        badge_no: formData.badge_no,
        username: formData.username,
        email: formData.email,
        id_department: Number(formData.id_department),
        id_project: Number(formData.id_project),
        id_role: Number(formData.id_role),
        id_position: formData.id_position ? Number(formData.id_position) : null,
        addon_project:
          formData.project_ids?.length > 0
            ? formData.project_ids.join(";")
            : null,
      };

      await axios.put(`${API_URL}/user/update/${id}`, payload, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      await axios.post(
        `${API_URL}/portal_user_permission/user/${id}/sync`,
        { permission_ids: finalIds },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      if (Number(userId) === Number(user.id)) {
        const currentUserState = useUser.getState().user;
        useUser.getState().setUser({
          ...currentUserState,
          name: payload.full_name,
          role_id: payload.id_role,
          permission_ids: finalIds,
        });
      }

      await showAlert("Success!", "success", "User synchronization complete.");
      router.push("/user_management/user_list/list");
    } catch (err) {
      console.error("Final Sync Error:", err);
      const msg = err.response?.data?.message || "Failed to synchronize data";
      showAlert("Error", "error", msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const inputClass = { label: "font-semibold mb-1 text-gray-700" };

  if (loadingData) {
    return (
      <AuthLayout sidebarList={userList}>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
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
              <Paper
                radius="md"
                shadow="md"
                className="bg-white p-8 border border-gray-200"
              >
                <h2 className="text-teal-600 font-bold mb-6 uppercase">
                  Basic Info
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextInput
                    required
                    label="Badge ID"
                    value={formData.badge_no}
                    onChange={(e) => handleChange("badge_no", e.target.value)}
                    error={errors.badge_no}
                    classNames={inputClass}
                  />
                  <TextInput
                    required
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    error={errors.full_name}
                    classNames={inputClass}
                  />
                  <TextInput
                    required
                    label="Username"
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    error={errors.username}
                    classNames={inputClass}
                  />
                  <TextInput
                    required
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    classNames={inputClass}
                  />
                </div>
                <h2 className="text-teal-600 font-bold my-6 uppercase">
                  Organization
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Select
                    required
                    label="Department"
                    data={deptOptions}
                    value={formData.id_department}
                    onChange={(v) => handleChange("id_department", v)}
                    classNames={inputClass}
                  />
                  <Select
                    required
                    searchable
                    label="Position"
                    data={positionOptions}
                    value={formData.id_position}
                    onChange={(v) => handleChange("id_position", v)}
                    error={errors.id_position}
                    classNames={inputClass}
                  />
                  <Select
                    required
                    label="Project"
                    data={projectOptions}
                    value={formData.id_project}
                    onChange={(v) => handleChange("id_project", v)}
                    classNames={inputClass}
                  />
                  <Select
                    required
                    label="Role"
                    data={roleOptions}
                    value={formData.id_role}
                    onChange={(v) => handleChange("id_role", v)}
                    classNames={inputClass}
                  />
                </div>
              </Paper>

              <Paper
                radius="md"
                shadow="md"
                className="bg-white border border-gray-200 overflow-hidden"
              >
                <div className="border-b py-4 px-6 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-2 text-teal-600">
                    <IconShield size={18} />
                    <h2 className="text-sm font-bold uppercase tracking-wide">
                      Permissions Management
                    </h2>
                  </div>
                  <Badge color="teal" variant="light">
                    {selectedPermissionIds.length} Active
                  </Badge>
                </div>
                <PermissionManager
                  permissions={permissions}
                  selectedIds={selectedPermissionIds}
                  inheritedIds={rolePermissionIds}
                  onTogglePermission={handleTogglePermission}
                  onToggleGroup={handleToggleGroup}
                  loading={loadingPermissions}
                />
              </Paper>

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
