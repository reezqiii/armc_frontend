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
      name: "user", // key untuk persist di localStorage
    }
  )
);

export default useUser;
