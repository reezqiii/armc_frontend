import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select, NumberInput } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Head from "next/head";
import warehouseList from "@/data/sidebar/WarehouseList";

import useSwal from "@/hooks/useSwal";

export default function AddWarehouse() {
  const router = useRouter();
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();

  const [formData, setFormData] = useState({
    item_code: "",
    item_name: "",
    category: "",
    quantity: 0,
    unit: "Pcs",
    location: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    } else if (formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmClick = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return; 
    }

    const result = await showConfirm(
      "Add Inventory Item?",
      "Are you sure you want to add this item to the warehouse?",
      "Yes, Add",
    );

    if (result.isConfirmed) {
      executeSaveData();
    }
  };

  const executeSaveData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/warehouse`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      if (response.status === 409) {
        await showAlert(
          "Duplicate",
          "warning",
          response.data.message || "Item Code already exists",
          "OK",
        );
        return;
      }

      await showAlert(
        "Success",
        "success",
        "Inventory item successfully added.",
        "OK",
      );
      router.push("/warehouse/list");
    } catch (error) {
      await showAlert("Error", "error", "Failed to add inventory item.", "OK");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={warehouseList}>
      <Head>
        <title>Add Inventory | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Add Inventory Item
            </h1>
          </div>

          <form>
            <div className="p-6 space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  required
                  label="Quantity"
                  value={formData.quantity}
                  error={errors.quantity} 
                  onChange={(v) => handleChange("quantity", v)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
                <TextInput
                  required
                  label="Unit"
                  placeholder="e.g. Pcs, Kg, Liters" 
                  value={formData.unit}
                  error={errors.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  classNames={{
                    label: "font-semibold mb-0 text-gray-700",
                    description: "text-xs italic mb-1", 
                  }}
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

            <div className="flex justify-between px-6 pb-6 pt-2 border-t border-gray-100">
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
