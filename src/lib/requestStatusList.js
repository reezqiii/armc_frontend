export const REQUEST_STATUS_MAP = {
  0: {
    label: "Draft",
    bg: "#6c757d",
    text: "#fff",
  },
  1: {
    label: "Pending Dept Head",
    bg: "#0dcaf0",
    text: "#fff",
  },
  2: {
    label: "Rejected by Dept Head",
    bg: "#dc3545",
    text: "#fff",
  },
  5: {
    label: "Pending IT Manager",
    bg: "#0dcaf0",
    text: "#fff",
  },
  6: {
    label: "Rejected by IT Manager",
    bg: "#dc3545",
    text: "#fff",
  },
  7: {
    label: "Completed",
    bg: "#28a745",
    text: "#fff",
  },
};

export const getRequestStatus = (statusCode) =>
  REQUEST_STATUS_MAP[statusCode] ?? {
    label: "Unknown",
    bg: "#6c757d",
    text: "#fff",
  };
