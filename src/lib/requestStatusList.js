export const REQUEST_STATUS_MAP = {
  0: { label: "Draft", color: "gray" },
  1: { label: "Awaiting HOD Approval", color: "yellow" },
  2: { label: "Rejected by HOD", color: "red" },
  3: { label: "Awaiting Lead IT Approval", color: "yellow" },
  4: { label: "Rejected by Lead IT", color: "red" },
  5: { label: "Awaiting IT Manager Approval", color: "yellow" },
  6: { label: "Rejected by IT Manager", color: "red" },
  7: { label: "Completed", color: "green" },
  8: { label: "Returned for Revision", color: "gray" },
};

export const getRequestStatus = (statusCode) =>
  REQUEST_STATUS_MAP[statusCode] ?? {
    label: "Unknown",
    color: "gray",
  };
