import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import Head from "next/head";
import userList from "@/data/sidebar/UserList";

function EditPermission() {
  const router = useRouter();
  const { id } = router.query;
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();
  const [formData, setFormData] = useState({
    permission_name: "",
    index_key: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!id) return;
    const fetchPermission = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/portal-permission/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({
          permission_name: data.permission_name ?? "",
          index_key: data.index_key ?? "",
        });
      } catch {
        showAlert("Error", "error", "Failed to fetch permission.", "OK");
      }
    };
    fetchPermission();
  }, [id, API_URL, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await showAlert(
      "Update Permission",
      "question",
      "Are you sure?",
      "Yes, Update",
      true,
    );
    if (!result.isConfirmed) return;
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/portal-permission/${id}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      showAlert("Success", "success", "Permission successfully updated.", "OK");
      router.push("/user_management/permission");
    } catch {
      showAlert("Error", "error", "Failed to update permission.", "OK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Edit Permission | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Edit Permission
            </h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <TextInput
                required
                label="Permission Name"
                placeholder="e.g. Create User"
                value={formData.permission_name}
                onChange={(e) =>
                  handleChange("permission_name", e.target.value)
                }
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />
              <TextInput
                required
                label="Index Key"
                placeholder="e.g. user.create"
                value={formData.index_key}
                onChange={(e) => handleChange("index_key", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />
            </div>
            <div className="flex justify-between px-6 pb-6">
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
                Update
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

EditPermission.title = "Edit Permission";
export default EditPermission;
