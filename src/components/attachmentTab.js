import Datatables from "@/components/custom/Datatables";
import { Button, Paper, Textarea, FileInput } from "@mantine/core";
import { formatDate } from "@/lib/dateFormat";
import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconTrash, IconUpload } from "@tabler/icons-react";
import Swal from "sweetalert2";
import useEncrypt from "@/hooks/useEncrypt";

const AttachmentTab = ({ idRequest }) => {
  const { user } = useUser();
  const API = useApi();
  const API_URL = API.API_URL;
  const { encrypt } = useEncrypt();

  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  // data table
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  // serverside states
  const [sorting, setSorting] = useState([{ id: "created_at", desc: true }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const encryptedId = useMemo(() => {
    if (!idRequest) return null;
    return encrypt(String(idRequest));
  }, [idRequest, encrypt]);

  const getData = useCallback(async () => {
    if (!encryptedId) return;

    const sort_by = sorting[0]?.id || "created_at";
    const sort_order = sorting[0]?.desc ? "DESC" : "ASC";

    const filterObj = Object.fromEntries(
      columnFilters.map((f) => [f.id, f.value]),
    );

    const search = JSON.stringify({
      id_request: encryptedId,
      ...filterObj,
    });

    const res = await axios.get(
      `${API_URL}/sftp/serverside_list?search=${encodeURIComponent(search)}&sort_by=${sort_by}&sort_order=${sort_order}&page=${pagination.pageIndex}&size=${pagination.pageSize}`,
      { headers: { Authorization: `Bearer ${user.token}` } },
    );

    setData(res.data.data || []);
    setTotalPages(res.data.total_pages || 1);
  }, [
    API_URL,
    encryptedId,
    sorting,
    columnFilters,
    pagination.pageIndex,
    pagination.pageSize,
    user.token,
  ]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This attachment will be removed.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      try {
        await axios.delete(`${API_URL}/sftp/delete/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setData((prev) => prev.filter((item) => item.id !== id));

        Swal.fire("Deleted!", "Attachment has been deleted.", "success");
      } catch (err) {
        Swal.fire("Error", "Failed to delete attachment.", "error");
      }
    },
    [API_URL, user.token],
  );

  const handleUpload = async () => {
    if (!file) {
      Swal.fire("Warning", "Please select a PDF file first.", "warning");
      return;
    }

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      Swal.fire("Error", "Only PDF files are allowed.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("remarks", remarks);
    formData.append("id_request", encrypt(String(idRequest)));

    try {
      await axios.post(`${API_URL}/sftp/upload`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "File uploaded successfully.", "success");

      setFile(null);
      setRemarks("");

      setPagination((p) => ({ ...p, pageIndex: 0 }));
      getData();
    } catch (err) {
      Swal.fire(
        "Upload Failed",
        err?.response?.data?.message || "Failed to upload file.",
        "error",
      );
    }
  };

  /* TABLE */
  const columns = useMemo(
    () => [
      {
        id: "no",
        header: "No",
        size: 40,
        cell: ({ row }) =>
          row.index + 1 + pagination.pageIndex * pagination.pageSize,
      },
      {
        accessorKey: "file_name",
        header: "Attachment",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <a
            href={`${API_URL}/sftp/download/${row.original.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline font-medium"
          >
            Attachment
          </a>
        ),
      },
      {
        accessorKey: "uploaded_by",
        header: "Upload By",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) => row.original.uploaded_by || "-",
      },
      {
        accessorKey: "created_at",
        header: "Upload Date",
        enableSorting: true,
        enableColumnFilter: true,
        cell: ({ row }) =>
          formatDate(row.original.created_at, { showTime: true }),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        id: "action",
        header: "Action",
        enableSorting: true,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <Button
            color="red"
            size="xs"
            onClick={() => handleDelete(row.original.id)}
          >
            <IconTrash size={14} />
          </Button>
        ),
      },
    ],
    [pagination.pageIndex, pagination.pageSize, API_URL, handleDelete],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: totalPages,
  });

  return (
    <Paper
      radius="md"
      withBorder
      shadow="xs"
      className="p-0 mt-4 overflow-hidden border-gray-200"
    >
      <div className="bg-blue-600 shadow-sm">
        <div className="px-6 md:px-10 py-3 text-sm font-bold text-white uppercase tracking-widest">
          Attachment Files
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* FORM */}
        <div className="space-y-4">
          <Textarea
            label="Remarks"
            placeholder="Enter remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
          />

          <FileInput
            label="Select File to Upload :"
            value={file}
            onChange={(selectedFile) => {
              if (!selectedFile) {
                setFile(null);
                return;
              }

              const isPdf =
                selectedFile.type === "application/pdf" &&
                selectedFile.name.toLowerCase().endsWith(".pdf");

              if (!isPdf) {
                Swal.fire({
                  icon: "error",
                  title: "Invalid File",
                  text: "Only PDF files are allowed.",
                });
                return;
              }

              setFile(selectedFile);
            }}
            placeholder="Choose PDF file"
            accept="application/pdf"
            clearable
            description={
              <span className="text-xs text-red-500">
                * Only PDF format is allowed.
              </span>
            }
          />

          <Button onClick={handleUpload} leftSection={<IconUpload size={16} />}>
            Upload
          </Button>
        </div>

        {/* TABLE */}
        <Datatables table={table} totalPages={totalPages} />
      </div>
    </Paper>
  );
};

export default AttachmentTab;
