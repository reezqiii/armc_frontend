import AuthLayout from "@/components/layout/authLayout";
import {
  Button,
  Paper,
  TextInput,
  NumberInput,
  Loader,
  Text,
} from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import useSwal from "@/hooks/useSwal";
import Head from "next/head";
import warehouseList from "@/data/sidebar/WarehouseList";
import useDecrypt from "@/hooks/useDecrypt";

export default function EditWarehouse() {
  const router = useRouter();
  const { id } = router.query;
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();
  const { decrypt } = useDecrypt();

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    category: "",
    quantity: 0,
    unit: "",
    location: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id || !user?.token) return;

    const fetchItem = async () => {
      try {
        setLoadingData(true);

        const realId = decrypt(id);

        const res = await axios.get(`${API_URL}/warehouse/${realId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setFormData({
          item_code: res.data.item_code || "",
          item_name: res.data.item_name || "",
          category: res.data.category || "",
          quantity: res.data.quantity || 0,
          unit: res.data.unit || "Pcs",
          location: res.data.location || "",
        });
      } catch (e) {
        console.error("Failed to load record:", e);
        showAlert("Error", "error", "Item not found", "OK");
        router.push("/warehouse/list");
      } finally {
        setLoadingData(false);
      }
    };

    fetchItem();
  }, [id, API_URL, user?.token, router]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.item_code) newErrors.item_code = "Item Code is required";
    if (!formData.item_name) newErrors.item_name = "Item Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.location) newErrors.location = "Location is required";

    if (
      formData.quantity === null ||
      formData.quantity === undefined ||
      formData.quantity === ""
    ) {
      newErrors.quantity = "Quantity is required";
    } else if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const confirm = await showConfirm(
      "Update Inventory Item?",
      "Are you sure you want to save these changes?",
      "Yes, Update",
    );

    if (confirm.isConfirmed) {
      executeUpdateData();
    }
  };

  const executeUpdateData = async () => {
    try {
      setLoadingSubmit(true);
      const realId = decrypt(id);

      await axios.put(`${API_URL}/warehouse/${realId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      await showAlert(
        "Success",
        "success",
        "Inventory record successfully updated.",
        "OK",
      );
      router.push("/warehouse/list");
    } catch (e) {
      await showAlert("Error", "error", "Failed to update record.", "OK");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingData) {
    return (
      <AuthLayout sidebarList={warehouseList}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader color="teal" size="lg" />
          <Text color="dimmed" mt="sm">
            Loading inventory data...
          </Text>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout sidebarList={warehouseList}>
      <Head>
        <title>Edit Inventory | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Edit Inventory Item
            </h1>
          </div>

          <form>
            <div className="p-6 md:p-8 space-y-4">
              <TextInput
                required
                label="Item Code"
                placeholder="e.g. MAT-001"
                value={formData.item_code}
                error={errors.item_code}
                onChange={(e) => handleChange("item_code", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <TextInput
                required
                label="Item Name"
                placeholder="e.g. Raw Steel Plate"
                value={formData.item_name}
                error={errors.item_name}
                onChange={(e) => handleChange("item_name", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <TextInput
                required
                label="Category"
                placeholder="e.g. Raw Material, Spare Part"
                value={formData.category}
                error={errors.category}
                onChange={(e) => handleChange("category", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NumberInput
                  required
                  label="Quantity"
                  min={0}
                  value={formData.quantity}
                  error={errors.quantity}
                  onChange={(v) => handleChange("quantity", v)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />

                <TextInput
                  required
                  label="Unit"
                  placeholder="e.g. Pcs, Kg, Liters, Meters"
                  value={formData.unit}
                  error={errors.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
              </div>

              <TextInput
                required
                label="Location"
                placeholder="e.g. Zone A-1"
                value={formData.location}
                error={errors.location}
                onChange={(e) => handleChange("location", e.target.value)}
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
                onClick={handleConfirm}
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
