// helpers/requestStatus.helper.js

export const REQUEST_STATUS = {
  DRAFT: "Draft",

  // 3
  PENDING_LEAD_IT: "Pending by Lead IT",

  // 5
  PENDING_IT_MANAGER: "Pending by IT Manager",

  // 7
  COMPLETED: "Completed",

  RETURNED: "Returned",
};

export const RETURNABLE_STATUSES = [
  REQUEST_STATUS.PENDING_LEAD_IT,     // 3
  REQUEST_STATUS.PENDING_IT_MANAGER,  // 5
  REQUEST_STATUS.COMPLETED,           // 7
];

/**
 * Check apakah status adalah Draft (0)
 * @param {string} statusName
 */
export const isDraftStatus = (statusName) => {
  return statusName === REQUEST_STATUS.DRAFT;
};

/**
 * Check apakah request bisa di-return
 * @param {string} statusName
 */
export const isReturnableStatus = (statusName) => {
  return RETURNABLE_STATUSES.includes(statusName);
};

/**
 * Helper gabungan untuk Action permission
 * (opsional tapi recommended)
 */
export const getRequestActionPermission = (statusName, hasPermission) => {
  return {
    canSubmitToHOD: isDraftStatus(statusName),
    canReturn: hasPermission && isReturnableStatus(statusName),
  };
};