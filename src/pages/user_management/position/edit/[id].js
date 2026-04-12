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

function EditPosition() {
  const router = useRouter();
  const { id } = router.query;
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!id || !user?.token) return;

    const fetchPosition = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/portal-position/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setName(data.position_name ?? "");
      } catch (error) {
        console.error("Error fetching position:", error);
        showAlert("Error", "error", "Failed to fetch position data.", "OK");
      }
    };

    fetchPosition();
  }, [id, API_URL, user.token]);

  const handleSubmit = async (e) => {
  e.preventDefault();

  const result = await showAlert(
    "Update Position",
    "question",
    "Are you sure you want to update this position?",
    "Yes, Update",
    true,
  );

  if (!result.isConfirmed) return;

  try {
    setLoading(true);
    const response = await axios.patch(
      `${API_URL}/portal-position/${id}`,
      { position_name: name },
      { 
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500 
      },
    );

    if (response.status === 409) {
      return showAlert(
        "Duplicate Data",
        "warning",
        response.data.message || "Position name already exists.",
        "Try Another Position Name"
      );
    }

    if (response.status === 200) {
      showAlert("Success", "success", "Position successfully updated.", "OK");
      router.push("/user_management/position/list");
    } else {
      showAlert("Error", "error", response.data.message || "Failed to update.", "OK");
    }
  } catch (error) {
    console.error("Error updating position:", error);
    showAlert("Error", "error", "Failed to update position. Check your connection.", "OK");
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Edit Position | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Edit Position
            </h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <TextInput
                required
                label="Position Name"
                placeholder="Input position name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />
            </div>
            <div className="flex justify-between px-6 pb-6">
              <Button
                leftSection={<IconArrowLeft size={18} />}
                color="gray"
                variant="subtle"
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
                Update Position
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

EditPosition.title = "Edit Position";
export default EditPosition;
