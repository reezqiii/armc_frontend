import { cn } from "@/lib/utils";
import useCollapseStore from "@/store/useLayout";
import useUser from "@/store/useUser";
import { NavLink } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function Sidebar({ className, sidebarList }) {
  const { sidebarCollapsed } = useCollapseStore();
  const path = usePathname();
  const router = useRouter();
  const permissions_key = useUser((s) => s.user.permissions_key);

  // ← 3. filter menu
  const filteredList = sidebarList.map((item) => ({
    ...item,
    child: item.child?.filter(
      (child) =>
        !child.permission || permissions_key.includes(child.permission),
    ),
  }));

  return (
    <aside
      className={cn(
        `bg-teal-900 h-full left-0 md:h-auto top-0 z-40 border-r-2 border-r-muted transition-[width]
        ${sidebarCollapsed ? "md:w-0 w-0" : "md:w-64 w-80"}`,
        className,
      )}
    >
      {!sidebarCollapsed &&
        filteredList.map((item, index) => (
          <NavLink
            key={index}
            onClick={() =>
              router.push(item.child && item.child.length > 0 ? "#" : item.href)
            }
            label={item.title}
            leftSection={item.icon}
            variant="filled"
            active={item.href === path}
            childrenOffset={28}
            defaultOpened
            style={{ color: "white" }}
            styles={{
              root: {
                "&:hover": { backgroundColor: "#0f766e" },
                "&[dataActive]": { backgroundColor: "#0d9488" },
              },
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
          >
            {item.child &&
              item.child.length > 0 &&
              item.child.map((child, idx) => (
                <NavLink
                  key={idx}
                  onClick={() => router.push(child.href)}
                  label={child.title}
                  leftSection={child.icon}
                  variant="filled"
                  active={path === child.href}
                  childrenOffset={28}
                  style={{ color: "white" }}
                  styles={{
                    root: {
                      "&:hover": { backgroundColor: "#0f766e" },
                      "&[dataActive]": { backgroundColor: "#0d9488" },
                    },
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
                />
              ))}
          </NavLink>
        ))}
    </aside>
  );
}
