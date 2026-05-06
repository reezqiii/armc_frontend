import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: {
        id: 0,
        name: null,
        token: null,
        role: null,
        role_id: null,
        permission_ids: [],
        department: null,
      },
      setUser: (value) => {
        if (!value) {
          set({
            user: {
              id: 0,
              name: null,
              token: null,
              role: null,
              role_id: null,
              permission_ids: [],
              department: null,
            },
          });
          return;
        }

        set({
          user: {
            id: value.id,
            name: value.name || value.full_name,
            token: value.token,
            role: value.role ?? null,
            role_id: value.role_id ?? null,
            permission_ids: value.permission_ids ?? [],
            department: value.department ?? null,
          },
        });
      },
    }),
    {
      name: "user-storage",
    },
  ),
);

export default useUser;
