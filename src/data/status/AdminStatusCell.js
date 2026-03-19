import { getAdminStatus } from "@/lib/adminStatus";
import { Badge } from "@mantine/core";

export default function AdminStatusCell({ value: initialValue }) {
  const status = getAdminStatus(initialValue ?? 0);

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
