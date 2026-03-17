import { cn } from "@/lib/utils";
import useCollapseStore from "@/store/useLayout";
import { NavLink } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { hasPermission } from "@/lib/permissionHelper";
import useUser from "@/store/useUser";

export default function Sidebar({ className, sidebarList }) {
  const { sidebarCollapsed } = useCollapseStore();
  const path = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const router = useRouter();

  const permissions = useUser((state) => state.user?.permissions);

  const isChildActive = (child) => {
    if (child.restricted) {
      const childStatus = new URLSearchParams(child.href.split("?")[1]).get(
        "status",
      );

      return path === "/admin/admin_list" && status === childStatus;
    }

    return path === child.href;
  };

  const filteredSidebar = useMemo(() => {
    return sidebarList.filter((menu) => {
      if (!menu.requiredPermission) return true;
      return hasPermission(menu.requiredPermission);
    });
  }, [sidebarList]);

  return (
    <aside
      className={cn(
        `bg-teal-900 h-full left-0 md:h-auto top-0 z-40 border-r-2 border-r-muted transition-[width]
    ${sidebarCollapsed ? "md:w-0 w-0" : "md:w-64 w-80"}`,
        className,
      )}
    >
      {!sidebarCollapsed &&
        filteredSidebar.map((item, index) => (
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
              item.child.map((child, index) => (
                <NavLink
                  key={index}
                  onClick={() => router.push(child.href)}
                  label={child.title}
                  leftSection={child.icon}
                  variant="filled"
                  active={isChildActive(child)}
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
