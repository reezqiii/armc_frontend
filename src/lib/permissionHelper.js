import useUser from "@/store/useUser";

export function hasPermission(index) {
  const { user } = useUser.getState();

  if (!user.permissions || user.permissions.length === 0) return false;

  return user.permissions.some(p => p.index_key == index);
}