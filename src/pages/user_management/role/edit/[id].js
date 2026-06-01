import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  Checkbox,
  Badge,
  Loader,
  Text,
  Group,
  Divider,
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
import Head from "next/head";
import userList from "@/data/sidebar/UserList";
import PermissionManager from "@/components/common/PermissionManager";

function EditRole() {
  const router = useRouter();
  const { id } = router.query;
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  useEffect(() => {
    if (!id) return;
    const fetchRole = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/role/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setName(data.role_name ?? "");
      } catch {
        showAlert("Error", "error", "Failed to fetch role.", "OK");
      }
    };
    fetchRole();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        const { data } = await axios.get(`${API_URL}/role-permission/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPermissions(data);
        setSelectedIds(
          data.filter((p) => p.assigned).map((p) => p.id_permission),
        );
      } catch {
        showAlert("Error", "error", "Failed to fetch permissions.", "OK");
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

  const handleTogglePermission = (id_permission) => {
    setSelectedIds((prev) =>
      prev.includes(id_permission)
        ? prev.filter((id) => id !== id_permission)
        : [...prev, id_permission],
    );
  };

  const handleToggleGroup = (groupIds) => {
    if (!Array.isArray(groupIds)) return;

    const allSelected = groupIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await showAlert(
      "Update Role",
      "question",
      "Are you sure you want to save changes?",
      "Yes, Update",
      true,
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.patch(
        `${API_URL}/role/${id}`,
        { role_name: name },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );
      await axios.post(
        `${API_URL}/role-permission/${id}/sync`,
        { permission_ids: selectedIds },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      showAlert("Success", "success", "Role successfully updated.", "OK");
      router.push("/user_management/role/list");
    } catch {
      showAlert("Error", "error", "Failed to update role.", "OK");
    } finally {
      setLoading(false);
    }
  };

  const groupNames = Object.keys(grouped).sort();

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Edit Role | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <form onSubmit={handleSubmit}>
          <div className="max-w-3xl mx-auto space-y-4">
            <Paper
              radius="md"
              shadow="md"
              className="bg-white border border-gray-200"
            >
              <div className="border-b py-5 text-center">
                <h1 className="text-2xl font-bold text-teal-600 uppercase">
                  Edit Role
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Update role name and assign permissions
                </p>
              </div>
              <div className="p-6">
                <TextInput
                  required
                  label="Role Name"
                  placeholder="Input role name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
              </div>
            </Paper>

            <Paper
              radius="md"
              shadow="md"
              className="bg-white border border-gray-200 mt-4"
            >
              <div className="border-b py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconShield size={18} className="text-teal-600" />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Role Permissions
                  </h2>
                </div>
                <Badge color="teal" variant="light" size="sm">
                  {selectedIds.length} selected
                </Badge>
              </div>

              <PermissionManager
                permissions={permissions}
                selectedIds={selectedIds}
                inheritedIds={[]}
                onTogglePermission={handleTogglePermission}
                onToggleGroup={handleToggleGroup}
                loading={loadingPermissions}
              />
            </Paper>

            <div className="flex justify-between pb-6">
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
                color="teal"
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

EditRole.title = "Edit Role";
export default EditRole;
