export const REQUEST_STATUS_MAP = {
  0: {
    label: "Canceled", 
    bg: "#6c757d",
    text: "#fff",
  },
  1: {
    label: "Pending Dept Head Approval",
    bg: "#0dcaf0",
    text: "#fff",
  },
  2: {
    label: "Rejected by Dept Head Approval",
    bg: "#dc3545",
    text: "#fff",
  },
  3: {
    label: "Pending IT Head Approval", 
    bg: "#0dcaf0",
    text: "#fff",
  },
  4: {
    label: "Rejected by IT Head Approval",
    bg: "#dc3545",
    text: "#fff",
  },
  5: {
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