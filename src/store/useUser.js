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
            name: value.name,
            token: value.token,
            permissions: value.permissions ?? [],
          },
        });
      },
    }),
    {
      name: "user",
    }
  )
);

export default useUser;