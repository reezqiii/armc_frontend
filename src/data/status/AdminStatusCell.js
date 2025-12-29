import { Badge, Select, Center } from "@mantine/core";
import axios from "axios";
import { useState } from "react";

const STATUS_MAP = {
  0: { label: "On Queue", color: "yellow" },
  1: { label: "On Progress", color: "yellow" },
  2: { label: "Completed", color: "green" },
};

export default function AdminStatusCell({
  value: initialValue,
  id_request,
  API_URL,
  token,
  setData,
  permissions,
}) {
  const [value, setValue] = useState(initialValue ?? 0);
  const [loading, setLoading] = useState(false);

  const status = STATUS_MAP[value] || {
    label: "Unknown",
    color: "dark",
  };

  const canEdit = permissions?.itAction?.length > 0;

  const handleChange = async (newValue) => {
    setValue(newValue);
    setLoading(true);

    try {
      await axios.patch(
        `${API_URL}/requests/${id_request}/admin-status`,
        { request_admin: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(prev =>
        prev.map(item =>
          item.id_request === id_request
            ? { ...item, request_admin: newValue }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setValue(initialValue);
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) {
    return (
      <Center>
        <Badge color={status.color} variant="light">
          {status.label}
        </Badge>
      </Center>
    );
  }

  return (
    <Select
      size="xs"
      value={String(value)}
      onChange={(val) => handleChange(Number(val))}
      data={Object.entries(STATUS_MAP).map(([key, item]) => ({
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
