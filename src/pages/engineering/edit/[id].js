import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select, Textarea, Loader, Text } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Head from "next/head";
import engineeringList from "@/data/sidebar/EngineeringList";

// PENTING: Import custom hooks
import useSwal from "@/hooks/useSwal";
import useDecrypt from "@/hooks/useDecrypt";

export default function EditEngineering() {
  const router = useRouter();
  const { id } = router.query;
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal();
  const { decrypt } = useDecrypt();

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({
    wo_number: "",
    equipment_name: "",
    issue_description: "",
    priority: "Medium",
    status: "Pending", // Default fallback
  });

  // =========================================================
  // FETCH DATA LAMA SAAT HALAMAN DIBUKA
  // =========================================================
  useEffect(() => {
    if (!id || !user?.token) return;

    const fetchRecord = async () => {
      try {
        setLoadingData(true);

        // 3. Dekripsi ID dari URL agar kembali menjadi angka asli
        const realId = decrypt(id);

        // Tembak API menggunakan realId
        const response = await axios.get(`${API_URL}/engineering/${realId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setFormData({
          wo_number: response.data.wo_number || "",
          equipment_name: response.data.equipment_name || "",
          issue_description: response.data.issue_description || "",
          priority: response.data.priority || "Medium",
          status: response.data.status || "Pending",
        });
      } catch (error) {
        console.error("Failed to load record:", error);
        showAlert("Error", "error", "Failed to load engineering record.", "OK");
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

  // =========================================================
  // FUNGSI 1: TAMPILKAN POP-UP KONFIRMASI DULU
  // =========================================================
  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!formData.equipment_name || !formData.issue_description) {
      await showAlert(
        "Warning",
        "warning",
        "Please fill all required fields!",
        "OK"
      );
      return;
    }

    // Panggil showConfirm (WAJIB pakai await)
    const result = await showConfirm(
      "Update Engineering Record?",
      "Are you sure you want to save these changes?",
      "Yes, Update"
    );

    // JIKA USER KLIK "YES", BARU PANGGIL FUNGSI UPDATE KE API
    if (result.isConfirmed) {
      executeUpdateData();
    }
  };

  // =========================================================
  // FUNGSI 2: TEMBAK API KE BACKEND (PUT)
  // =========================================================
  const executeUpdateData = async () => {
    try {
      setLoadingSubmit(true);

      // 4. Dekripsi lagi saat mau nge-save
      const realId = decrypt(id);

      await axios.put(`${API_URL}/engineering/${realId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      // Tampilkan Pop-up Success (WAJIB await)
      await showAlert(
        "Success",
        "success",
        "Engineering record successfully updated.",
        "OK"
      );

      // Pindah halaman
      router.push("/engineering/list");
    } catch (error) {
      await showAlert(
        "Error",
        "error",
        "Failed to update engineering record.",
        "OK"
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Tampilan Loading di awal
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
        <title>Edit Engineering | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Edit Engineering
            </h1>
          </div>

          {/* Tag form dibiarkan polos, tanpa atribut onSubmit */}
          <form>
            <div className="p-6 md:p-8 space-y-5">
              <TextInput
                required
                label="WO Number"
                value={formData.wo_number}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <TextInput
                required
                label="Equipment Name"
                placeholder="e.g. CNC Machine"
                value={formData.equipment_name}
                onChange={(e) => handleChange("equipment_name", e.target.value)}
                classNames={{ label: "font-semibold mb-1 text-gray-700" }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  required
                  label="Priority"
                  data={["Low", "Medium", "High"]}
                  value={formData.priority}
                  onChange={(value) => handleChange("priority", value)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />

                <Select
                  required
                  label="Status"
                  data={["Pending", "In Progress", "Completed"]}
                  value={formData.status}
                  onChange={(value) => handleChange("status", value)}
                  classNames={{ label: "font-semibold mb-1 text-gray-700" }}
                />
              </div>

              <Textarea
                required
                label="Issue Description"
                placeholder="Describe the problem..."
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

              {/* TOMBOL SAVE DENGAN JURUS PAMUNGKAS */}
              <Button
                type="button" // PENTING: Jangan 'submit'
                onClick={handleConfirm} // PENTING: Panggil fungsi popup
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