import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput, Select, Loader, Text } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
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
    qc_status: "Pending", // Default fallback
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

        // Tembak API menggunakan realId (misal: /production/11)
        const response = await axios.get(`${API_URL}/production/${realId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setFormData({
          batch_id: response.data.batch_id || "",
          product_name: response.data.product_name || "",
          qc_status: response.data.qc_status || "Pending",
        });
      } catch (error) {
        console.error("Failed to load record:", error);
        showAlert("Error", "error", "Failed to load production record.", "OK");
        router.push("/production/list");
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

    if (!formData.product_name || !formData.qc_status) {
      await showAlert(
        "Warning",
        "warning",
        "Please fill all required fields!",
        "OK",
      );
      return;
    }

    // Panggil showConfirm (WAJIB pakai await)
    const result = await showConfirm(
      "Update Production Record?",
      "Are you sure you want to save these changes?",
      "Yes, Update",
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

      await axios.put(`${API_URL}/production/${realId}`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      // Tampilkan Pop-up Success (WAJIB await)
      await showAlert(
        "Success",
        "success",
        "Production record successfully updated.",
        "OK",
      );

      // Pindah halaman
      router.push("/production/list");
    } catch (error) {
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

  // Tampilan Loading di awal
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

          {/* Tag form dibiarkan polos, tanpa atribut onSubmit */}
          <form>
            <div className="p-6 md:p-8 space-y-5">
              <TextInput
                required
                label="Batch ID"
                value={formData.batch_id}
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

              <Select
                required
                label="QC Status"
                placeholder="Select current status"
                data={[
                  { value: "Pending", label: "Pending" },
                  { value: "Passed", label: "Passed (Approved)" },
                  { value: "Failed", label: "Failed (Rejected)" },
                ]}
                value={formData.qc_status}
                onChange={(value) => handleChange("qc_status", value)}
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
