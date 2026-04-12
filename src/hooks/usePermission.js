import useUser from "@/store/useUser";

export default function usePermission() {
  const { user } = useUser();
  const permissions = user?.permissions_key ?? [];
  const can = (permission) => permissions.includes(permission);
  const canAny = (...perms) => perms.some((p) => permissions.includes(p));
  const canAll = (...perms) => perms.every((p) => permissions.includes(p));

  return { can, canAny, canAll, permissions };
}
