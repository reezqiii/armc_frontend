export const REQUEST_STATUS_MAP = {
  0: { label: "Draft", className: "text-gray-500" },
  1: { label: "Awaiting HOD Approval", className: "text-yellow-500" },
  2: { label: "Rejected by HOD", className: "text-red-500" },
  3: { label: "Awaiting Lead IT Approval", className: "text-yellow-500" },
  4: { label: "Rejected by Lead IT", className: "text-red-500" },
  5: { label: "Awaiting IT Manager Approval", className: "text-yellow-500" },
  6: { label: "Rejected by IT Manager", className: "text-red-500" },
  7: { label: "Completed", className: "text-green-500" },
  8: { label: "Returned for Revision", className: "text-gray-500" },
};

export const getRequestStatus = (statusCode) =>
  REQUEST_STATUS_MAP[statusCode] ?? {
    label: "Unknown",
    className: "text-gray-500",
  };
