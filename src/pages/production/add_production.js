import AuthLayout from "@/components/layout/authLayout";
import { Button, Paper, TextInput } from "@mantine/core";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useState } from "react";
import axios from "axios";
import useUser from "@/store/useUser";
import useApi from "@/hooks/useApi";
import Head from "next/head";
import productionList from "@/data/sidebar/ProductionList";

// PENTING: Import custom hook milikmu
import useSwal from "@/hooks/useSwal";

export default function AddProduction() {
  const router = useRouter();
  const { API_URL } = useApi();
  const { user } = useUser();
  const { showAlert, showConfirm } = useSwal(); // Ambil fungsi dari hook

  const [formData, setFormData] = useState({
    batch_id: "",
    product_name: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // =========================================================
  // FUNGSI 1: TAMPILKAN POP-UP KONFIRMASI DULU
  // =========================================================
  const handleConfirm = async (e) => {
    e.preventDefault();

    // Validasi sederhana: Jangan izinkan save kalau kosong
    if (!formData.batch_id || !formData.product_name) {
      await showAlert(
        "Warning",
        "warning",
        "Please fill all required fields!",
        "OK",
      );
      return;
    }

    // Panggil showConfirm dari useSwal milikmu (WAJIB pakai await)
    const result = await showConfirm(
      "Add Production?",
      "Are you sure you want to add this?",
      "Yes, Add",
    );

    // JIKA USER KLIK "YES", BARU PANGGIL FUNGSI SAVE KE API
    if (result.isConfirmed) {
      executeSaveData();
    }
  };

  // =========================================================
  // FUNGSI 2: TEMBAK API (Hanya jalan jika klik YES)
  // =========================================================
  const executeSaveData = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/production`, formData, {
        headers: { Authorization: `Bearer ${user.token}` },
        validateStatus: (status) => status < 500,
      });

      // Validasi duplikat
      if (response.status === 409) {
        // WAJIB await agar pop-up tidak hilang/tertimpa
        await showAlert(
          "Duplicate",
          "warning",
          response.data.message || "Batch ID already exists",
          "OK",
        );
        return;
      }

      // Tampilkan Pop-up Success (WAJIB await)
      await showAlert(
        "Success",
        "success",
        "Production successfully added.",
        "OK",
      );

      // Baris ini HANYA akan tereksekusi SETELAH user klik tombol "OK" di popup success
      router.push("/production/list");
    } catch (error) {
      await showAlert(
        "Error",
        "error",
        "Failed to add production.",
        "OK",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout sidebarList={productionList}>
      <Head>
        <title>Add Production | PT. XYZ</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
        <Paper
          radius="md"
          shadow="md"
          className="bg-white max-w-2xl mx-auto border border-gray-200"
        >
          <div className="border-b py-6 text-center">
            <h1 className="text-2xl font-bold text-teal-600 uppercase">
              Add Production
            </h1>
          </div>

          {/* Tag form dibiarkan polos, tanpa atribut onSubmit */}
          <form>
            <div className="p-6 space-y-4">
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

            <div className="flex justify-between px-6 pb-6">
              <Button
                type="button"
                leftSection={<IconArrowLeft size={18} />}
                color="gray"
                onClick={() => router.back()}
              >
                Back
              </Button>

              {/* KUNCI UTAMANYA DI SINI */}
              <Button
                type="button" // PENTING: Type harus 'button', JANGAN 'submit'
                onClick={handleConfirm} // PENTING: Panggil fungsi popup saat diklik
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
