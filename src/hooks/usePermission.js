import useUser from "@/store/useUser";

export default function usePermission() {
  const { user } = useUser();
  const permissions = user?.permission_ids ?? [];
  const userRole = user?.role_name ?? "";
  const can = (permissionId) => permissions.includes(Number(permissionId));
  const canAny = (...permissionIds) =>
    permissionIds.some((p) => permissions.includes(Number(p)));
  const canAll = (...permissionIds) =>
    permissionIds.every((p) => permissions.includes(Number(p)));
  const isRole = (targetRole) => userRole === targetRole;
  const isAnyRole = (...targetRoles) => targetRoles.some((r) => userRole === r);
  return {
    can,
    canAny,
    canAll,
    isRole,
    isAnyRole,
    permissions,
    userRole,
  };
}
