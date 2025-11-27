export const hasPermission = (permissions, key) => {
  return permissions?.[key]?.length > 0;
};
