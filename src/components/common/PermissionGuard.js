import usePermission from "@/hooks/usePermission";

/**
 * PermissionGuard Wrapper
 * @param {number|number[]} permission - Satu ID atau daftar ID permission
 * @param {string} strategy - 'any' (salah satu punya) atau 'all' (semua harus punya)
 * @param {React.ReactNode} children - Komponen yang akan dilindungi
 * @param {React.ReactNode} fallback - Komponen pengganti jika tidak punya izin (opsional)
 */
export default function PermissionGuard({
  permission,
  strategy = "any",
  children,
  fallback = null,
}) {
  const { can, canAny, canAll } = usePermission();

  let hasAccess = false;

 
  if (Array.isArray(permission)) {
    hasAccess =
      strategy === "all" ? canAll(...permission) : canAny(...permission);
  }
 
  else {
    hasAccess = can(permission);
  }

 
  return hasAccess ? <>{children}</> : fallback;
}
