export const canEditCancel = (request, user, permissions) => {

  if (permissions?.itAction?.length > 0) return true;

  if (
    request.requestor_id === user?.id &&
    request.request_status < 1
  ) return true;

  if (
    request.approval_hod_by?.id === user?.id &&
    request.request_status === 1
  ) return true;

  return false;
};

export const canChangeAdminStatus = (permissions) => {
  return permissions?.itAction?.length > 0;
};

const canAccess = (user, menuItem) => {
  if (!menuItem.restricted) return true;
  return user.isAdmin; 
};
