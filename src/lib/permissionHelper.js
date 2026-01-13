import useUser from "@/store/useUser";

// export function hasPermission(index) {
//   const { user } = useUser.getState();

//   console.log("USER PERMISSIONS:", user.permissions);


//   if (!user.permissions || user.permissions.length === 0) return false;

//   return user.permissions.some(p => p.index_key == index);
// }

export function hasPermission(index) {
  const { user } = useUser.getState();

  if (!Array.isArray(user?.permissions)) return false;

  return user.permissions.some(p =>
    Number(p.index_key) === Number(index)
  );
}
