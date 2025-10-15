import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: {
        id: 0,
        name: null,
        token: null,
      },
      setUser: (value) => set({ user: value }),
    }),
    {
      name: "user",
    }
  )
);

export default useUser;
