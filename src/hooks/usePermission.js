import useUser from "@/store/useUser";

export default function usePermission() {
  const { user } = useUser();

  // 1. Ekstraksi Permissions (Granular Actions)
  const permissions = user?.permissions_key ?? [];

  // 2. Ekstraksi Role(s) (High-level Grouping)
  // Menangani kemungkinan backend mengirimkan role berupa string tunggal ("it_manager")
  // atau array of strings (["employee", "approver"])
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : [];

  // --- PERMISSION CHECKERS ---
  const can = (permission) => permissions.includes(permission);
  const canAny = (...perms) => perms.some((p) => permissions.includes(p));
  const canAll = (...perms) => perms.every((p) => permissions.includes(p));

  // --- ROLE CHECKERS ---
  // Mengecek apakah user memiliki role spesifik
  const isRole = (targetRole) => roles.includes(targetRole);

  // Mengecek apakah user memiliki setidaknya satu dari beberapa role
  const isAnyRole = (...targetRoles) =>
    targetRoles.some((r) => roles.includes(r));

  // Mengecek apakah user memiliki semua role yang disyaratkan (jarang dipakai tapi berguna)
  const isAllRoles = (...targetRoles) =>
    targetRoles.every((r) => roles.includes(r));

  return {
    can,
    canAny,
    canAll,
    isRole,
    isAnyRole,
    isAllRoles,
    permissions,
    roles,
  };
}
