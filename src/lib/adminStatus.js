export const ADMIN_STATUS_MAP = {
  0: {
    label: "On Queue",
    bg: "#ffc107",
    text: "#fff",
  },
  1: {
    label: "On Progress",
    bg: "#0dcaf0",
    text: "#fff",
  },
  2: {
    label: "Completed",
    bg: "#28a745",
    text: "#fff",
  },
};

export const getAdminStatus = (statusCode) =>
  ADMIN_STATUS_MAP[statusCode] ?? {
    label: "Unknown",
    bg: "#6c757d",
    text: "#fff",
  };
