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

  const toggleGroup = (group) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleAll = (groupPermissions) => {
    const groupIds = groupPermissions.map((p) => p.id_permission);
    const allSelected = groupIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !groupIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...groupIds])]);
    }
  };

  const togglePermission = (id_permission) => {
    setSelectedIds((prev) =>
      prev.includes(id_permission)
        ? prev.filter((id) => id !== id_permission)
        : [...prev, id_permission],
    );
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
            {/* Role Name Card */}
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

            {/* Permissions Card */}
            <Paper
              radius="md"
              shadow="md"
              className="bg-white border border-gray-200"
            >
              <div className="border-b py-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconShield size={18} className="text-teal-600" />
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Permissions
                  </h2>
                </div>
                <Badge color="teal" variant="light" size="sm">
                  {selectedIds.length} selected
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
                    const allChecked = groupIds.every((id) =>
                      selectedIds.includes(id),
                    );
                    const someChecked =
                      groupIds.some((id) => selectedIds.includes(id)) &&
                      !allChecked;
                    const checkedCount = groupIds.filter((id) =>
                      selectedIds.includes(id),
                    ).length;

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
                              onChange={() => toggleAll(groupPerms)}
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
                            {groupPerms.map((p) => (
                              <div
                                key={p.id_permission}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                                  selectedIds.includes(p.id_permission)
                                    ? "bg-teal-50 border border-teal-200"
                                    : "hover:bg-gray-50 border border-transparent"
                                }`}
                                onClick={() =>
                                  togglePermission(p.id_permission)
                                }
                              >
                                <Checkbox
                                  checked={selectedIds.includes(
                                    p.id_permission,
                                  )}
                                  onChange={() =>
                                    togglePermission(p.id_permission)
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  color="teal"
                                  size="sm"
                                />
                                <div>
                                  <p className="text-sm text-gray-700 font-medium">
                                    {p.permission_name}
                                  </p>
                                  {p.index_key && (
                                    <p className="text-xs text-gray-400 font-mono">
                                      {p.index_key}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
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

            {/* Action Buttons */}
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
