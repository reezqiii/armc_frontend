import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUser = create(
  persist(
    (set) => ({
      user: {
        id: 0,
        name: null, // Properti ini yang dipanggil di Header {user.name}
        token: null,
        permissions: [],
      },
      setUser: (value) => {
        set({
          user: {
            id: value.id,
            // AMBIL DARI full_name (Sesuai output Backend kamu)
            name: value.full_name || value.name, 
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