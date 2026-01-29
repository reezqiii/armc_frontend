import useCollapseStore from "@/store/useLayout";
import { ActionIcon, Collapse, Menu, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconUserCog,
  IconHome,
  IconMenu2,
  IconCaretRight,
} from "@tabler/icons-react";
import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import React from "react";

const navigation = [
  {
    name: "Home",
    url: "/",
    icon: <IconHome size={20} />,
    permission: 1,
  },

  {
    name: "User Request",
    url: "/user_request/list/all",
    icon: <IconUser size={20} />,
    permission: 1,
  },

  {
    name: "User Management",
    url: "/user_management/user_list/active",
    icon: <IconUserCog size={20} />,
    permission: 1,
  },

  // {
  //   name: "User Management",
  //   url: "/user_management/requestor_list",
  //   icon: <IconUserCog size={20} />,
  //   permission: 1,
  // },
];

export default function Navigation() {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const { toggleCollapse } = useCollapseStore();
  const path = usePathname();

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
      <nav className="w-full sticky md:relative top-0 z-50 md:z-1 flex items-center justify-between bg-blue-600 px-4 ">
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

        {/* <div className="md:hidden">
          <ActionIcon
            variant="subtle"
            size="xl"
            className="mr-2"
            onClick={toggle}
          >
            <IconMenu2 color="white" />
          </ActionIcon>
        </div> */}
      </nav>

      <Collapse in={opened} className="md:hidden sticky top-10 z-50">
        <nav className="w-full flex flex-col bg-blue-600 px-4 py-1">
          {navigation.map((item, index) => (
            <div key={index} className="text-white">
              <NavLink
                component={Link}
                href={item.url}
                // onClick={() => (item.child ? item.url : router.push(item.url))}
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
                      // onClick={() => router.push(child.url)}
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
