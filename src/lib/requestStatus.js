export const REQUEST_STATUS = {
  DRAFT: 0,
  PENDING_HOD: 1,
  PENDING_LEAD_IT: 3,
  PENDING_IT_MANAGER: 5,
  COMPLETED: 7,
};

export const getRequestActionPermission = (status, hasPermission) => {
  // IT USER → semua tombol
  if (hasPermission) {
    return {
      canEditCancel: true,
      canReturn: true,
      showOnlyDetail: false,
    };
  }

  // NON-IT USER
  const canEditCancel =
    status === REQUEST_STATUS.DRAFT ||
    status === REQUEST_STATUS.PENDING_HOD;

  return {
    canEditCancel,
    canReturn: false,
    showOnlyDetail: !canEditCancel,
  };
};
