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

function AddPosition() {
  const router = useRouter();
  const API_URL = useApi().API_URL;
  const { user } = useUser();
  const { showAlert } = useSwal();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await showAlert(
      "Add Position",
      "question",
      "Are you sure?",
      "Yes, Add",
      true,
    );

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/portal-position`,
        { position_name: name },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      showAlert("Success", "success", "Position successfully added.", "OK");
      router.push("/user_management/position/list");
    } catch (error) {
      console.error("Error adding position:", error);

      const serverMessage = error.response?.data?.message;
      const statusCode = error.response?.status;

      if (statusCode === 409) {
        return showAlert(
          "Duplicate Position",
          "warning",
          serverMessage ||
            "This position name is already registered in the system.",
          "Try Another Position Name",
        );
      } else if (statusCode === 400) {
        showAlert(
          "Invalid Input",
          "error",
          Array.isArray(serverMessage)
            ? serverMessage.join(", ")
            : serverMessage,
          "Fix It",
        );
      } else {
        showAlert(
          "System Error",
          "error",
          "An unexpected error occurred while saving. Please contact IT Support.",
          "Close",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={userList}>
      <Head>
        <title>Add Position | ARMC</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Add Position
            </h1>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <TextInput
                required
                label="Position Name"
                placeholder="Input position name (e.g. Senior Engineer)"
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
                Save Position
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}

AddPosition.title = "Add Position";
export default AddPosition;
