export const canEditCancel = (request, user, permissions) => {

  // Admin IT -> semua bisa
  if (permissions?.itAction?.length > 0) return true;

  // Requestor -> hanya sebelum masuk HOD
  if (
    request.requestor_id === user?.id &&
    request.request_status < 1
  ) return true;

  // HOD -> hanya jika masih status pending HOD
  if (
    request.approval_hod_by?.id === user?.id &&
    request.request_status === 1
  ) return true;

  return false;
};

export const canChangeAdminStatus = (permissions) => {
  return permissions?.itAction?.length > 0;
};

export const canSeeAdminSidebar = (permissions) => {
  return permissions?.itAction?.length > 0;
};