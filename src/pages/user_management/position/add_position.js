import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
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
        console.error(e);
      }
    };
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await showAlert(
      "Add Position",
      "question",
      "Are you sure you want to add this new position?",
      "Yes, Add",
      true,
    );

    if (!result.isConfirmed) return;

    let response;

    try {
      setLoading(true);

      response = await axios.post(
        `${API_URL}/portal-position`,
        {
          position_name: name,
          id_role: Number(idRole),
        },
        { headers: { Authorization: `Bearer ${user.token}` } },
      );

      if (response && response.data && response.data.success === false) {
        return showAlert(
          "Duplicate Entry",
          "warning",
          response.data.message || "This position name is already registered.",
          "Try Another Name",
        );
      }

      showAlert(
        "Success",
        "success",
        "Position has been added successfully.",
        "OK",
      );
      router.push("/user_management/position/list");
    } catch (error) {
      console.error("Error adding position:", error);

      const errorMsg =
        error.response?.data?.message || "An unexpected error occurred.";

      showAlert("System Error", "error", errorMsg, "Close");
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
                * This role will be automatically suggested when a user with
                this position requests access.
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
