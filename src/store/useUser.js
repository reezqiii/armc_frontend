import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: {
        id: 0,
        name: null,
        token: null,
        permissions: [],
      },
      setUser: (value) => {
        if (!value) {
          set({
            user: {
              id: 0,
              name: null,
              token: null,
              permissions: [],
            },
          });
          return;
        }

        set({
          user: {
            id: value.id,
            name: value.full_name || value.name,
            token: value.token,
            permissions: value.permissions ?? [],
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
    }
  )
);

export default useUser;