import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select } from "@mantine/core";
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
  const [idRole, setIdRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/role`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const mapped = data.map((r) => ({
          value: String(r.id_role),
          label: r.role_name,
        }));
        setRoles(mapped);
      } catch (e) {
        console.error("Error fetching roles:", e);
      }
    };
    if (user?.token) fetchRoles();
  }, [API_URL, user.token]);

  useEffect(() => {
    if (!id || !user?.token) return;

    const fetchPosition = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/portal-position/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setName(data.position_name ?? "");
        setIdRole(data.id_role ? String(data.id_role) : null);
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
        {
          position_name: name,
          id_role: Number(idRole),
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
          validateStatus: (status) => status < 500,
        },
      );

      if (response.data.success === false) {
        return showAlert(
          "Update Conflict",
          "warning",
          response.data.message ||
            "The name is already used by another record.",
          "Check Name Again",
        );
      }

      showAlert(
        "Updated",
        "success",
        "Position details have been updated.",
        "OK",
      );
      router.push("/user_management/position/list");
    } catch (error) {
      console.error("Error updating position:", error);
      showAlert(
        "Update Failed",
        "error",
        "Could not update position. Please check your connection.",
        "OK",
      );
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
                className="mb-4"
                classNames={{
                  label: "font-semibold mb-1 text-gray-700 text-sm",
                }}
              />

              <Select
                required
                label="Role Mapping"
                placeholder="Select role for this position"
                data={roles}
                value={idRole}
                onChange={setIdRole}
                searchable
                nothingFoundMessage="Role not found"
                classNames={{
                  label: "font-semibold mb-1 text-gray-700 text-sm",
                }}
              />

              <p className="text-[10px] text-gray-400 italic mt-2">
                * Updating this will affect the suggested role for future access
                requests.
              </p>
            </div>

            <div className="flex justify-between items-center px-8 pb-8">
              <Button
                leftSection={<IconArrowLeft size={16} />}
                color="gray"
                variant="subtle"
                size="sm"
                onClick={() => router.back()}
              >
                Back
              </Button>

              <Button
                type="submit"
                leftSection={<IconDeviceFloppy size={18} />}
                color="teal"
                size="sm"
                loading={loading}
                className="px-6 shadow-md"
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
