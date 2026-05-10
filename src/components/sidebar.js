import { cn } from "@/lib/utils";
import useCollapseStore from "@/store/useLayout";
import useUser from "@/store/useUser";
import { NavLink } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo } from "react";

export default function Sidebar({ className, sidebarList }) {
  const { sidebarCollapsed } = useCollapseStore();
  const path = usePathname();
  const router = useRouter();

  const userState = useUser((s) => s.user);
  const permissionIds = useMemo(
    () => (userState?.permission_ids || []).map(Number),
    [userState?.permission_ids],
  );

  const filteredList = useMemo(() => {
    return sidebarList
      .filter((item) => {
        if (!item.permission) return true;

        if (Array.isArray(item.permission)) {
          return item.permission.some((id) =>
            permissionIds.includes(Number(id)),
          );
        }

        return permissionIds.includes(Number(item.permission));
      })
      .map((item) => {
        const visibleChildren = item.child?.filter((child) => {
          if (!child.permission) return true;

          if (Array.isArray(child.permission)) {
            return child.permission.some((id) =>
              permissionIds.includes(Number(id)),
            );
          }

          return permissionIds.includes(Number(child.permission));
        });

        return { ...item, child: visibleChildren || [] };
      })
      .filter((item) => {
        if (item.child && item.child.length === 0 && !item.href) return false;
        return true;
      });
  }, [sidebarList, permissionIds]);

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
              item.child && item.child.length > 0
                ? null
                : router.push(item.href)
            }
            label={item.title}
            leftSection={item.icon}
            variant="filled"
            active={item.href ? path === item.href : false}
            childrenOffset={28}
            defaultOpened
            style={{ color: "white" }}
            styles={{
              root: {
                "&:hover": { backgroundColor: "#0f766e" },
                "&[data-active]": { backgroundColor: "#0d9488" },
              },
            }}
          >
            {item.child.map((child, idx) => (
              <NavLink
                key={idx}
                onClick={() => router.push(child.href)}
                label={child.title}
                leftSection={child.icon}
                variant="filled"
                active={path === child.href}
                style={{ color: "white" }}
                styles={{
                  root: {
                    "&:hover": { backgroundColor: "#0f766e" },
                    "&[data-active]": { backgroundColor: "#0d9488" },
                  },
                }}
              />
            ))}
          </NavLink>
        ))}
    </aside>
  );
}
