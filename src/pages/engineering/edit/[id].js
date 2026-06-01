import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  Select,
  Textarea,
  Loader,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Head from "next/head";
import engineeringList from "@/data/sidebar/EngineeringList";
import useSwal from "@/hooks/useSwal";
import useDecrypt from "@/hooks/useDecrypt";

export default function EditEngineering() {
  const router = useRouter();
  const { id } = router.query;
  const { API_URL } = useApi();
  const { user } = useUser();

  const { decrypt } = useDecrypt();
  const { showAlert, showConfirm } = useSwal();

  const [formData, setFormData] = useState({
    wo_number: "",
    equipment_name: "",
    issue_description: "",
    priority: "Medium",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    if (!id || !user?.token) return;

    const fetchRecord = async () => {
      try {
        setLoadingData(true);
        const realId = decrypt(id);

        const response = await axios.get(`${API_URL}/engineering/${realId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const data = response.data;

        let priorityStr = "Medium";
        if (data.priority === 1) priorityStr = "Low";
        if (data.priority === 3) priorityStr = "High";

        setFormData({
          wo_number: data.wo_number || "",
          equipment_name: data.equipment_name || "",
          issue_description: data.issue_description || "",
          priority: priorityStr,
        });
      } catch (error) {
        console.error("Failed to load record:", error);
        showAlert("Error", "error", "Failed to load Work Order data.", "OK");
        router.push("/engineering/list");
      } finally {
        setLoadingData(false);
      }
    };

    fetchRecord();
  }, [id, API_URL, user?.token, router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmClick = async (e) => {
    e.preventDefault();

    if (
      !formData.wo_number ||
      !formData.equipment_name ||
      !formData.issue_description
    ) {
      await showAlert(
        "Warning",
        "warning",
        "Please fill all required fields!",
        "OK",
      );
      return;
    }

    const result = await showConfirm(
      "Update Work Order?",
      "Are you sure you want to save these changes?",
      "Yes, Update",
    );

    if (result.isConfirmed) {
      executeUpdateData();
    }
  };

  const executeUpdateData = async () => {
    try {
      setLoadingSubmit(true);
      const realId = decrypt(id);

      let priorityInt = 2;
      if (formData.priority === "Low") priorityInt = 1;
      if (formData.priority === "Medium") priorityInt = 2;
      if (formData.priority === "High") priorityInt = 3;

      const payloadData = {
        ...formData,
        priority: priorityInt,
      };

      const response = await axios.put(
        `${API_URL}/engineering/${realId}`,
        payloadData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          validateStatus: (status) => status < 500,
        },
      );

      if (response.status === 409) {
        await showAlert(
          "Duplicate",
          "warning",
          response.data.message || "WO Number already exists!",
          "OK",
        );
        return;
      }

      await showAlert(
        "Success",
        "success",
        "Work Order successfully updated.",
        "OK",
      );
      router.push("/engineering/list");
    } catch (error) {
      await showAlert("Error", "error", "Failed to update Work Order.", "OK");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingData) {
    return (
      <AuthLayout sidebarList={engineeringList}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader color="teal" size="lg" />
          <Text color="dimmed" mt="sm">
            Loading record data...
          </Text>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={engineeringList}>
      <Head>
        <title>Edit Work Order | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center bg-teal-50/50">
            <h1 className="text-2xl font-bold text-teal-700 uppercase">
              Edit Work Order
            </h1>
          </div>

          <form>
            <div className="p-6 md:p-8 space-y-4">
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

            <div className="flex justify-between px-6 pb-6 pt-4 border-t border-gray-100">
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
                loading={loadingSubmit}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Paper>
      </div>
    </AuthLayout>
  );
}
