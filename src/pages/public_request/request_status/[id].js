import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import useApi from "@/hooks/useApi";
import { Paper } from "@mantine/core";
import { formatDateTime } from "@/lib/dateFormat";

export default function RequestStatusPage() {
  const router = useRouter();
  const { id } = router.query; // Ambil ID dari URL
  const API = useApi();
  const API_URL = API.API_URL;

  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return; // Tunggu router siap

    const fetchRequest = async () => {
      try {
  const res = await axios.get(`${API_URL}/requests/${id}`);
  console.log("API response:", res.data);
  if (res.data) {
    setRequestData(res.data);
  } else {
    setError("Request not found");
  }
} catch (err) {
  console.error("Error fetching request:", err.response?.status, err.response?.data || err.message);
  setError("Failed to fetch request");

      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id, API_URL]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const formattedId = `ITF14-${String(requestData.id_request).padStart(6, "0")}`;

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-6 md:px-10 w-full">
      <div className="max-w-3xl mx-auto">
        <Paper className="p-8" radius="md" shadow="md">
          <h1 className="text-xl font-bold mb-4">Request Submitted</h1>
          <p><strong>Request ID:</strong> {formattedId}</p>
          <p><strong>Created Date:</strong> {formatDateTime(requestData.created_date, false)}</p>
          <p><strong>Status:</strong> {requestData.request_status}</p>
          {requestData.remarks && <p><strong>Remarks:</strong> {requestData.remarks}</p>}
        </Paper>
      </div>
    </div>
  );
}
