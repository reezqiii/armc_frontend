import Datatables from '@/components/custom/Datatables';
import AuthLayout from '@/components/layout/authLayout';
import requestorList from '@/data/sidebar/RequestorList';
import useApi from '@/hooks/useApi';
import useUser from '@/store/useUser';
import { Button, Paper, Badge } from '@mantine/core';
import { IconInfoCircle, IconEdit, IconX, IconCheck } from '@tabler/icons-react';
import axios from 'axios';
import Swal from "sweetalert2";
import { useRouter } from 'next/router';
import useEncrypt from "@/hooks/useEncrypt";
import { formatDateTime } from "@/lib/dateFormat";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';

function PendingHODList() {
  const router = useRouter();
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();

  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [savedFilter, setSavedFilter] = useState({})
  const [isCanceling, setIsCanceling] = useState(false);
  const [sorting, setSorting] = useState([{ id: "id_request", desc: true }]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

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
      const encryptedId = encrypt(String(id_request));

      await axios.put(`${API_URL}/requests/cancel/${encryptedId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setData(prevData => prevData.filter(item => item.id_request !== id_request));

      Swal.fire({
        icon: 'success',
        title: 'Canceled!',
        text: 'The request has been marked as canceled.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error canceling request:", err);
      Swal.fire({
        icon: 'error',
        title: 'Failed!',
        text: 'Failed to cancel the request. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApproveMultiple = async () => {
    const ids = table.getSelectedRowModel().rows.map(r => r.original.id_request);

    if (ids.length === 0) return;

    const confirm = await Swal.fire({
      title: `Approve ${ids.length} selected request(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, approve",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.put(
        `${API_URL}/requests/hod-approval/bulk`,
        {
          ids,
          action: "approve",
          remarks: "",
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: `${ids.length} request(s) approved successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });

      table.resetRowSelection();
      getData();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to approve requests.", "error");
    }
  };

  const handleRejectMultiple = async () => {
    const ids = table.getSelectedRowModel().rows.map(r => r.original.id_request);

    if (ids.length === 0) return;

    const confirm = await Swal.fire({
      title: `Reject ${ids.length} selected request(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, reject",
    });

    if (!confirm.isConfirmed) return;

    const { value: remarks } = await Swal.fire({
      title: "Reason for Rejection",
      input: "textarea",
      inputPlaceholder: "Enter your reason...",
      showCancelButton: true,
    });

    if (!remarks) {
      Swal.fire("Cancelled", "You must provide a reason.", "info");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/requests/hod-approval/bulk`,
        {
          ids,
          action: "reject",
          remarks,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Rejected!",
        text: `${ids.length} request(s) rejected successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });

      table.resetRowSelection();
      getData();

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to reject requests.", "error");
    }
  };

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={el => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          ref={el => {
            if (el) el.indeterminate = row.getIsSomeSelected();
          }}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 40,
    },
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) =>
        row.index + 1 + pagination.pageIndex * pagination.pageSize,
      size: 40,
    },
    {
      accessorFn: row => row.id_request,
      id: 'id_request',
      header: 'No Request',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => `ITF14-${String(row.original.id_request).padStart(6, '0')}`,
    },
    {
      accessorFn: row => row.created_date,
      id: 'created_date',
      header: 'Request Date',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => formatDateTime(row.original.created_date, false),
    },
    {
      accessorFn: row => row.requestor_name,
      id: 'requestor_name',
      header: 'Requestor',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.badge_no,
      id: 'badge_no',
      header: 'Badge ID',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.full_name,
      id: 'full_name',
      header: 'Full Name',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.department_name,
      id: 'department_name',
      header: 'Department',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.position_name,
      id: 'position_name',
      header: 'Position',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.project_name,
      id: 'project_name',
      header: 'Project',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.company_name,
      id: 'company_name',
      header: 'Company',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.email,
      id: 'email',
      header: 'Email',
      enableColumnFilter: true,
      enableSorting: true,
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.type,
      id: 'type',
      header: 'Type',
      enableColumnFilter: true,
      enableSorting: true,
      cell: ({ row }) => (row.original.type === 1 ? 'Public' : 'Login'),
    },
    {
      id: 'status',
      header: 'Status',
      enableColumnFilter: false,
      enableSorting: true,
      cell: () => <Badge color="yellow">Pending by HOD Req</Badge>,
    },
    {
      accessorFn: row => row.id_request,
      id: 'action',
      header: 'Action',
      enableColumnFilter: false,
      enableSorting: true,
      cell: ({ row }) => {
        const encryptedId = encrypt(String(row.original.id_request));

        return (
          <div className="flex flex-row gap-2 justify-center">
            <Button
              leftSection={<IconInfoCircle size={16} />}
              color="blue"
              size="xs"
              onClick={() => router.push(`/user_request/detail_req/${encryptedId}`)}
            >
              Details
            </Button>

            <Button
              leftSection={<IconEdit size={16} />}
              color="yellow"
              size="xs"
              onClick={() => router.push(`/user_request/edit_req/${encryptedId}`)}
            >
              Update
            </Button>

            <Button
              leftSection={<IconX size={16} />}
              color="red"
              size="xs"
              onClick={() => handleCancel(row.original.id_request)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        );
      }
    }
  ], [encrypt, isDeleting, pagination.pageIndex, pagination.pageSize, router]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {},
    state: {
      columnFilters,
      sorting,
      pagination,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  });

  const getData = useCallback(async () => {
    const sort_by = sorting[0]?.id || "id_request";
    const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

    const filterObj = Object.fromEntries(
      columnFilters.map(f => [f.id, f.value])
    );

    const search = JSON.stringify({
      request_status: 1,
      // approval_hod_by: user.id,
      // requestor_id: user.id,
      ...filterObj
    });

    try {
      const res = await axios.post(
        `${API_URL}/requests/serverside_list?search=${encodeURIComponent(search)}&sort_by=${sort_by}&sort_order=${sort_order}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setData(res.data.data);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      console.error("Error fetching draft data:", err);
    }
  }, [API_URL, pagination, sorting, columnFilters, user.token]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <AuthLayout sidebarList={requestorList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8 py-4">
          <Paper radius="sm" mt="md" withBorder shadow="xs" className="p-4">

            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <h1 className="text-xl font-bold text-blue-500">
                Pending HOD Request List
              </h1>
            </div>

            <div className="overflow-x-auto">
              <Datatables table={table} totalPages={totalPages} />
            </div>

            <div className="flex justify-between items-center border-t pt-3 mt-4">

              <span className="text-sm text-gray-700">
                Selected: {table.getSelectedRowModel().rows.length}
              </span>

              {user?.id && data.some(item => item.approval_hod_by?.id === user.id) && (
                <div className="flex gap-2">
                  <Button
                    leftSection={<IconCheck size={16} />}
                    color="green"
                    onClick={handleApproveMultiple}
                    disabled={table.getSelectedRowModel().rows.length === 0}
                  >
                    Approve
                  </Button>

                  <Button
                    leftSection={<IconX size={16} />}
                    color="red"
                    onClick={handleRejectMultiple}
                    disabled={table.getSelectedRowModel().rows.length === 0}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}

PendingHODList.title = "Pending HOD List";
export default PendingHODList