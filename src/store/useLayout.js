import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCollapseStore = create(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
      toggleCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "sidebar-collapsed",
    }
  )
);

export default useCollapseStore;
