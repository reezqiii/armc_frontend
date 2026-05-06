import useEncrypt from "@/hooks/useEncrypt";
import usePermission from "@/hooks/usePermission";
import useCollapseStore from "@/store/useLayout";
import useUser from "@/store/useUser";
import { ActionIcon, Collapse, Menu, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconUserCog,
  IconHome,
  IconMenu2,
  IconBuildingFactory,
  IconTool,
  IconBox,
  IconCaretRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { ROLE_GROUPS, ROLES } from "./constants/roles";


export default function Navigation() {
  const { user } = useUser();
  console.log("DATA USER SAAT INI:", user);
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const { toggleCollapse } = useCollapseStore();
  const { isAnyRole } = usePermission();

  const navigation = useMemo(() => {
    return [
      {
        name: "Home",
        url: "/",
        icon: <IconHome size={20} />,
      },

      ...(isAnyRole(ROLES.ADMINISTRATOR)
        ? [
            {
              name: "User Management",
              url: "/user_management/dashboard",
              icon: <IconUserCog size={20} />,
            },
          ]
        : []),

      // Menggunakan ROLE_GROUPS agar lebih bersih
      ...(isAnyRole(...ROLE_GROUPS.CAN_ACCESS_REQUEST)
        ? [
            {
              name: "Access Request",
              url: "/user_request/dashboard",
              icon: <IconUser size={20} />,
            },
          ]
        : []),

      ...(isAnyRole(...ROLE_GROUPS.CAN_ACCESS_PRODUCTION)
        ? [
            {
              name: "Production & Quality",
              url: "/production/dashboard",
              icon: <IconBuildingFactory size={20} />,
            },
          ]
        : []),

      ...(isAnyRole(ROLES.ADMINISTRATOR)
        ? [
            {
              name: "Engineering",
              url: "/engineering/dashboard",
              icon: <IconTool size={20} />,
            },
          ]
        : []),

      ...(isAnyRole(ROLES.ADMINISTRATOR)
        ? [
            {
              name: "Warehouse",
              url: "/warehouse/dashboard",
              icon: <IconBox size={20} />,
            },
          ]
        : []),
    ];
  }, [isAnyRole]);

  const items = navigation.map((link, index) => {
    const menuItems = link.child?.map((item, indexItem) => (
      <Menu.Item key={indexItem} leftSection={<IconCaretRight size={20} />}>
        {item.name}
      </Menu.Item>
    ));

    if (menuItems) {
      return (
        <Menu key={index} shadow="md" position="bottom-start">
          <Menu.Target>
            <div className="w-fit text-white">
              <Link
                href={link.url}
                className={`p-2 ${
                  (link.url === "/" && router.asPath === "/") ||
                  (link.url !== "/" && router.asPath.startsWith(link.url))
                    ? "bg-white bg-opacity-25 text-white"
                    : ""
                } hover:bg-white hover:text-black rounded-md text-sm flex`}
                data-active={true}
              >
                <div className="mr-2">{link.icon}</div>
                {link.name}
              </Link>
            </div>
          </Menu.Target>

          <Menu.Dropdown>{menuItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <div key={index} className="w-fit text-white">
        <Link
          href={link.url}
          className={`p-2 ${
            (link.url === "/" && router.asPath === "/") ||
            (link.url !== "/" && router.asPath.startsWith(link.url))
              ? "bg-white bg-opacity-25 text-white"
              : ""
          } hover:bg-white hover:text-black rounded-md text-sm flex`}
          data-active={true}
        >
          <div className="mr-2">{link.icon}</div>
          {link.name}
        </Link>
      </div>
    );
  });

  return (
    <>
      <nav className="w-full sticky md:relative top-0 z-50 md:z-1 flex items-center justify-between bg-teal-600 px-4 ">
        <div className="flex">
          <ActionIcon
            variant="subtle"
            size="xl"
            className="mr-2"
            onClick={toggleCollapse}
          >
            <IconMenu2 color="white" />
          </ActionIcon>

          <div className="hidden md:flex relative md:gap-1 md:items-center">
            {items}
          </div>
        </div>

        <div className="md:hidden">
          <ActionIcon
            variant="subtle"
            size="xl"
            className="mr-2"
            onClick={toggle}
          >
            <IconMenu2 color="white" />
          </ActionIcon>
        </div>
      </nav>

      <Collapse in={opened} className="md:hidden sticky top-10 z-50">
        <nav className="w-full flex flex-col bg-teal-600 px-4 py-1">
          {navigation.map((item, index) => (
            <div key={index} className="text-white">
              <NavLink
                component={Link}
                href={item.url}
                label={item.name}
                leftSection={item.icon}
                variant="subtle"
                childrenOffset={40}
                onClick={(event) =>
                  (event.currentTarget.style.backgroundColor = "#2563eb")
                }
              >
                {item.child &&
                  item.child.length > 0 &&
                  item.child.map((child, index) => (
                    <NavLink
                      key={index}
                      component={Link}
                      href={child.url}
                      label={child.name}
                      variant="subtle"
                      onClick={(event) =>
                        (event.currentTarget.style.backgroundColor = "#2563eb")
                      }
                    />
                  ))}
              </NavLink>
            </div>
          ))}
        </nav>
      </Collapse>
    </>
  );
}
