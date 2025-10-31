import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import { requestorList } from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge } from '@mantine/core';
import { IconSend, IconInfoCircle, IconEdit, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React from 'react';
import Swal from "sweetalert2";
import { formatDate } from "@/lib/dateFormat";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';

export default function DraftRequestList() {
  DraftRequestList.title = "Draft Request List";

  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancel = async (id_request) => {
    const result = await Swal.fire({
      title: 'Are you sure you want to cancel this request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
    });

    if (!result.isConfirmed) return;

    setIsCanceling(true);
    try {
      const res = await axios.put(
        `${API_URL}/requests/cancel/${id_request}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.status === 200) {
        setData(prev => prev.filter(item => item.id_request !== id_request));

        await Swal.fire({
          icon: "success",
          title: "Submitted!",
          text: "The request has been successfully submitted to HOD.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error('Error canceling request:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Failed to cancel the request. Please try again.',
      });
    } finally {
      setIsCanceling(false);
    }
  };

  // 🔹 Column Request
  const columns = useMemo(() => [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => row.index + 1 + pagination.pageIndex * pagination.pageSize,
      size: 40,
    },
    {
      accessorFn: row => row.created_date,
      id: 'created_date',
      header: 'Request Date',
      cell: ({ row }) => formatDate(row.original.created_date),
    },
    {
      accessorFn: row => row.requestor_name,
      id: 'requestor_name',
      header: 'Requestor',
    },
    {
      accessorFn: row => row.full_name,
      id: 'full_name',
      header: 'Full Name'
    },
    {
      accessorFn: row => row.badge_no,
      id: 'badge_no',
      header: 'Badge ID'
    },
    {
      accessorFn: row => row.email,
      id: 'email',
      header: 'Email'
    },
    {
      accessorFn: row => row.project_name,
      id: 'project_name',
      header: 'Project'
    },
    {
      accessorFn: row => row.department_name,
      id: 'department_name',
      header: 'Department'
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => <Badge color="gray">Draft</Badge>,
    },
    {
      accessorFn: row => row.id_request,
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <Button
            leftSection={<IconSend size={16} />}
            color="green"
            fullWidth
            onClick={() => handleSubmitToHOD(row.original.id_request)}
          >
            Submit to HOD
          </Button>

          <Button
            leftSection={<IconInfoCircle size={16} />}
            color="blue"
            fullWidth
            onClick={() => router.push(`/user_request/detail_req/${row.original.id_request}`)}
          >
            Details
          </Button>

          <Button
            leftSection={<IconEdit size={16} />}
            color="orange"
            fullWidth
            onClick={() => router.push(`/user_request/edit_req/${row.original.id_request}`)}
          >
            Edit
          </Button>

          <Button
            leftSection={<IconX size={16} />}
            color="red"
            fullWidth
            onClick={() => handleCancel(row.original.id_request)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
        </div>
      ),
    }

  ], [pagination.pageIndex, pagination.pageSize]);

  // 🔹 Fetch data hanya status = 0 (Draft)
  const getData = useCallback(async () => {
    try {
      const search = JSON.stringify({ request_status: 0 });
      const res = await axios.post(
        `${API_URL}/requests/serverside_list?search=${encodeURIComponent(search)}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}`, 'Cache-Control': 'no-cache' } }
      );

      setData(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Error fetching draft data:", err);
    }
  }, [API_URL, pagination.pageIndex, pagination.pageSize, user.token]);

  useEffect(() => {
    getData();
  }, [getData]);

  // 🔹 Submit to HOD
  const handleSubmitToHOD = async (id_request) => {
    const result = await Swal.fire({
      title: "Submit to HOD?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, submit!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await axios.put(
        `${API_URL}/requests/${id_request}`,
        { request_status: 1 },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.status === 200) {
        // Hapus data dari draft secara lokal tanpa fetch ulang
        setData((prev) => prev.filter((item) => item.id_request !== id_request));

        await Swal.fire({
          icon: "success",
          title: "Submitted!",
          text: "The request has been successfully submitted to HOD.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error("Error submitting to HOD:", err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "An error occurred while submitting to HOD. Please try again.",
      });
    }
  };


  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
  });

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h1 className="text-xl font-bold text-blue-500">Draft Request List</h1>
            </div>
            <div className="overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
