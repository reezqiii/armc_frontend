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

function AddRole() {
  const router = useRouter();
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await showAlert(
      "Add Role",
      "question",
      "Are you sure you want to add this role?",
      "Yes, Add",
      true,
    );
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/role`,
        { role_name: name },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 409) {
        return showAlert(
          "Duplicate Role",
          "warning",
          response.data.message || "This role name already exists.",
          "Try Another Role Name",
        );
      }

      if (response.status === 201 || response.status === 200) {
        showAlert("Success", "success", "Role successfully added.", "OK");
        router.push("/user_management/role/list");
      }
    } catch (error) {
      showAlert("Error", "error", "Failed to connect to server.", "OK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Add Role | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Add Role
            </h1>
          </div>
          
          <form onSubmit={handleSubmit}>
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

AddRole.title = "Add Role";
export default AddRole;
