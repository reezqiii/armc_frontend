import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select, Textarea } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Head from "next/head";
import engineeringList from "@/data/sidebar/EngineeringList";
import Swal from "sweetalert2";

export default function AddEngineering() {
  const router = useRouter();
  const { API_URL } = useApi();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    wo_number: "",
    equipment_name: "",
    issue_description: "",
    priority: "Medium",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmClick = (e) => {
    e.preventDefault();

    if (
      !formData.wo_number ||
      !formData.equipment_name ||
      !formData.issue_description
    ) {
      Swal.fire("Warning", "Please fill all required fields!", "warning");
      return;
    }

    Swal.fire({
      title: "Create Work Order?",
      text: "Are you sure you want to submit this Work Order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#20c997",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Create",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        executeSaveData();
      }
    });
  };

  const executeSaveData = async () => {
    try {
      setLoading(true);

      let priorityInt = 2;
      if (formData.priority === "Low") priorityInt = 1;
      if (formData.priority === "Medium") priorityInt = 2;
      if (formData.priority === "High") priorityInt = 3;

      const payloadData = {
        ...formData,
        priority: priorityInt,
      };

      const response = await axios.post(`${API_URL}/engineering`, payloadData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      if (response.status === 409) {
        Swal.fire(
          "Duplicate",
          response.data.message || "WO Number already exists!",
          "warning",
        );
        return;
      }

      Swal.fire("Success", "Work Order successfully created.", "success").then(
        () => {
          router.push("/engineering/list");
        },
      );
    } catch (error) {
      Swal.fire("Error", "Failed to create Work Order.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={engineeringList}>
      <Head>
        <title>New Work Order | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center bg-teal-50/50">
            <h1 className="text-2xl font-bold text-teal-700 uppercase">
              New Work Order
            </h1>
          </div>

          <form>
            <div className="p-6 space-y-4">
              <TextInput
                required
                label="WO Number"
                placeholder="e.g. WO-ENG-001"
                value={formData.wo_number}
                onChange={(e) => handleChange("wo_number", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <TextInput
                required
                label="Equipment Name"
                placeholder="e.g. CNC Machine A"
                value={formData.equipment_name}
                onChange={(e) => handleChange("equipment_name", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <Select
                required
                label="Priority"
                data={["Low", "Medium", "High"]}
                value={formData.priority}
                onChange={(value) => handleChange("priority", value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <Textarea
                required
                label="Issue Description"
                placeholder="Describe the problem with the equipment..."
                minRows={4}
                value={formData.issue_description}
                onChange={(e) =>
                  handleChange("issue_description", e.target.value)
                }
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />
            </div>

            <div className="flex justify-between px-6 pb-6">
              <Button
                type="button"
                leftSection={<IconArrowLeft size={18} />}
                color="gray"
                variant="light"
                onClick={() => router.back()}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleConfirmClick}
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
