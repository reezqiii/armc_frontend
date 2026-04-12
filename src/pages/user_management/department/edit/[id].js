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

function EditDepartment() {
  const router = useRouter();
  const { id } = router.query;
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/portal-department/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setName(data.name_of_department ?? "");
      } catch {
        showAlert("Error", "error", "Failed to fetch department.", "OK");
      }
    };
    fetch();
  }, [id, API_URL, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await showAlert(
      "Update Department",
      "question",
      "Are you sure you want to update this department?",
      "Yes, Update",
      true,
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await axios.patch(
        `${API_URL}/portal-department/${id}`,
        { name_of_department: name },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 409) {
        return showAlert(
          "Duplicate Department",
          "warning",
          response.data.message || "This department name already exists.",
          "Try Another Department Name",
        );
      }

      if (response.status === 200) {
        showAlert(
          "Success",
          "success",
          "Department successfully updated.",
          "OK",
        );
        router.push("/user_management/department/list");
      } else {
        showAlert(
          "Error",
          "error",
          response.data.message || "Failed to update.",
          "OK",
        );
      }
    } catch (error) {
      console.error("Update Error:", error);
      showAlert(
        "Error",
        "error",
        "An unexpected error occurred. Please try again.",
        "OK",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Edit Department | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Edit Department
            </h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <TextInput
                required
                label="Department Name"
                placeholder="Input department name"
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
                Update
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

EditDepartment.title = "Edit Department";
export default EditDepartment;
