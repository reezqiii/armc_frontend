import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: {
        id: 0,
        name: null,
        token: null,
        role: null, // ← role name: "Staff", "Administrator"
        role_id: null, // ← role id
        permissions: [], // ← existing (number array sistem lama)
        permissions_key: [], // ← derived dari role + user-specific
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
              permissions: [],
              permissions_key: [],
              department: null,
            },
          });
          return;
        }

        set({
          user: {
            id: value.id,
            name: value.full_name || value.name,
            token: value.token,
            role: value.role ?? null,
            role_id: value.role_id ?? null,
            permissions: value.permissions ?? [],
            permissions_key: value.permissions_key ?? [],
            department: value.department ?? null,
          },
        });
      },
    }),
    {
      name: "user",
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) =>
          localStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => localStorage.removeItem(name),
      },
    },
  ),
);

export default useUser;
