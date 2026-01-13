export const REQUEST_STATUS_MAP = {
  0: {
    label: "Draft",
    bg: "#6c757d",
    text: "#fff",
  },
  1: {
    label: "Pending Requestor Dept Head",
    bg: "#0dcaf0",
    text: "#fff",
  },
  2: {
    label: "Rejected by Dept Head",
    bg: "#dc3545",
    text: "#fff",
  },
  3: {
    label: "Pending Lead IT",
    bg: "#0dcaf0",
    text: "#fff",
  },
  4: {
    label: "Rejected by Lead IT",
    bg: "#dc3545",
    text: "#fff",
  },
  5: {
    label: "Pending IT Manager / Asst. IT Manager",
    bg: "#0dcaf0", // biru muda / info
    text: "#fff",
  },
  6: {
    label: "Rejected by IT Manager / Asst. IT Manager",
    bg: "#dc3545",
    text: "#fff",
  },
  7: {
    label: "Completed",
    bg: "#28a745",
    text: "#fff",
  },
  8: {
    label: "Returned for Revision",
    bg: "#fd7e14",
    text: "#fff",
  },
};

export const getRequestStatus = (statusCode) =>
  REQUEST_STATUS_MAP[statusCode] ?? {
    label: "Unknown",
    bg: "#6c757d",
    text: "#fff",
  };
