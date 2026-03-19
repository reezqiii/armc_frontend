import useUser from "@/store/useUser";

export default function usePermission() {
  const { user } = useUser();
  const permissions = user?.permissions_key ?? [];

  // Cek satu permission
  const can = (permission) => permissions.includes(permission);

  // Cek salah satu dari beberapa permission
  const canAny = (...perms) => perms.some((p) => permissions.includes(p));

  // Cek semua permission
  const canAll = (...perms) => perms.every((p) => permissions.includes(p));

  return { can, canAny, canAll, permissions };
}
