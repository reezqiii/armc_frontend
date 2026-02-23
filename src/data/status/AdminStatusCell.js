import { ADMIN_STATUS_MAP, getAdminStatus } from "@/lib/adminStatus";
import { hasPermission } from "@/lib/permissionHelper";
import { Badge, Select, Center } from "@mantine/core";
import axios from "axios";
import { useState } from "react";

export default function AdminStatusCell({
  value: initialValue,
  id_request,
  API_URL,
  token,
  setData,
}) {
  const [value, setValue] = useState(initialValue ?? 0);
  const [loading, setLoading] = useState(false);

  // PERMISSION IT ACTION (index 3)
  const canEdit = hasPermission(2);

  const status = getAdminStatus(value);

  const handleChange = async (newValue) => {
    setValue(newValue);
    setLoading(true);

    try {
      await axios.patch(
        `${API_URL}/requests/${id_request}/admin-status`,
        { request_admin: newValue },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setData((prev) =>
        prev.map((item) =>
          item.id_request === id_request
            ? { ...item, request_admin: newValue }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
      setValue(initialValue);
    } finally {
      setLoading(false);
    }
  };

  // TIDAK PUNYA PERMISSION
  if (!canEdit) {
    return (
      <div className="flex justify-center w-full">
        <Badge
          radius="sm"
          px="sm"
          styles={{
            root: {
              backgroundColor: status.bg,
              color: status.text,
              fontWeight: 600,
              textAlign: "center",
              textTransform: "none",
            },
          }}
        >
          {status.label}
        </Badge>
      </div>
    );
  }

  // PUNYA PERMISSION
  return (
    <Select
      size="xs"
      value={String(value)}
      onChange={(val) => handleChange(Number(val))}
      data={Object.entries(ADMIN_STATUS_MAP).map(([key, item]) => ({
        value: key,
        label: item.label,
      }))}
      disabled={loading}
      styles={{
        input: { textAlign: "center" },
      }}
    />
  );
}
