import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import Head from "next/head";
import userList from "@/data/sidebar/UserList";

function AddPermission() {
  const router = useRouter();
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();

  const [formData, setFormData] = useState({
    permission_name: "",
    permission_group: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await showAlert(
      "Add Permission",
      "question",
      "Are you sure?",
      "Yes, Add",
      true,
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/portal-permission`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 409) {
        return showAlert("Duplicate", "warning", response.data.message, "OK");
      }

      showAlert("Success", "success", "Permission successfully added.", "OK");
      router.push("/user_management/permission/list");
    } catch (error) {
      showAlert("Error", "error", "Failed to add permission.", "OK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Add Permission | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Add Permission
            </h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <TextInput
                required
                label="Permission Name"
                placeholder="e.g. request.create"
                value={formData.permission_name}
                onChange={(e) =>
                  handleChange("permission_name", e.target.value)
                }
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <TextInput
                required
                label="Permission Group"
                placeholder="e.g. Request, User, Project"
                value={formData.permission_group}
                onChange={(e) =>
                  handleChange("permission_group", e.target.value)
                }
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
                Save
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

AddPermission.title = "Add Permission";
export default AddPermission;
