import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Loader, Text } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Head from "next/head";
import productionList from "@/data/sidebar/ProductionList";
import useSwal from "@/hooks/useSwal";
import useDecrypt from "@/hooks/useDecrypt";

export default function EditProduction() {
  const router = useRouter();
  const { id } = router.query;
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();
  const { decrypt } = useDecrypt();

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    batch_id: "",
    product_name: "",
  });

  const fetchRecord = useCallback(
    async (encryptedId) => {
      if (!encryptedId || !user?.token) return;

      try {
        setLoadingData(true);
        const realId = decrypt(encryptedId);

        const response = await axios.get(`${API_URL}/production/${realId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setFormData({
          batch_id: response.data.batch_id || "",
          product_name: response.data.product_name || "",
        });
      } catch (error) {
        console.error("Failed to load record:", error);
        showAlert("Error", "error", "Failed to load production record.", "OK");
        router.push("/production/list");
      } finally {
        setLoadingData(false);
      }
    },
    [API_URL, user?.token],
  );

  useEffect(() => {
    if (id) {
      fetchRecord(id);
    }
  }, [id, fetchRecord]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!formData.batch_id || !formData.product_name) {
      await showAlert(
        "Warning",
        "warning",
        "Please fill all required fields!",
        "OK",
      );
      return;
    }

    const result = await showConfirm(
      "Update Production Record?",
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

      await axios.put(`${API_URL}/production/${realId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      await showAlert(
        "Success",
        "success",
        "Production record successfully updated.",
        "OK",
      );
      router.push("/production/list");
    } catch (error) {
      console.error(error);
      await showAlert(
        "Error",
        "error",
        "Failed to update production record.",
        "OK",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingData) {
    return (
      <AuthLayout sidebarList={productionList}>
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
    <AuthLayout sidebarList={productionList}>
      <Head>
        <title>Edit Production | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Edit Production
            </h1>
          </div>

          <form onSubmit={handleConfirm}>
            <div className="p-6 md:p-8 space-y-5">
              <TextInput
                required
                label="Batch ID"
                placeholder="e.g. BCH-001"
                value={formData.batch_id}
                onChange={(e) => handleChange("batch_id", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <TextInput
                required
                label="Product Name"
                placeholder="e.g. Main Engine Part A"
                value={formData.product_name}
                onChange={(e) => handleChange("product_name", e.target.value)}
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
                type="submit"
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
