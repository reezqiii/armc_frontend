import useUser from "@/store/useUser";
import usePermission from "@/hooks/usePermission";
import useCollapseStore from "@/store/useLayout";
import { ActionIcon, Collapse, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconUserCog,
  IconHome,
  IconMenu2,
  IconBuildingFactory,
  IconTool,
  IconBox,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";

export default function Navigation() {
  const { user } = useUser();
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);

  const { can, canAny } = usePermission();

  const toggleCollapse = useCollapseStore((state) => state.toggleCollapse);

  const navigation = useMemo(() => {
    return [
      {
        name: "Home",
        url: "/",
        icon: <IconHome size={20} />,
        show: true,
      },
      {
        name: "User Management",
        url: "/user_management/dashboard",
        icon: <IconUserCog size={20} />,
        show: can (40),
      },
      {
        name: "Access Request",
        url: "/user_request/dashboard",
        icon: <IconUser size={20} />,
        show: can (7),
      },
      {
        name: "Production & Quality",
        url: "/production/dashboard",
        icon: <IconBuildingFactory size={20} />,
        show: can (15),
      },
      {
        name: "Engineering",
        url: "/engineering/dashboard",
        icon: <IconTool size={20} />,
        show: can (18),
      },
      {
        name: "Warehouse",
        url: "/warehouse/dashboard",
        icon: <IconBox size={20} />,
        show: can (20),
      },
    ].filter((nav) => nav.show);
  }, [user, can]);

  const items = navigation.map((link, index) => {
    const isActive =
      (link.url === "/" && router.asPath === "/") ||
      (link.url !== "/" && router.asPath.startsWith(link.url));

    return (
      <div key={index} className="w-fit text-white">
        <Link
          href={link.url}
          className={`p-2 ${
            isActive ? "bg-white bg-opacity-25 text-white" : ""
          } hover:bg-white hover:text-black rounded-md text-sm flex transition-colors`}
        >
          <div className="mr-2">{link.icon}</div>
          {link.name}
        </Link>
      </div>
    );
  });

  return (
    <>
      <nav className="w-full sticky md:relative top-0 z-50 flex items-center justify-between bg-teal-600 px-4 h-12">
        <div className="flex items-center">
          <ActionIcon
            variant="subtle"
            size="lg"
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
          <ActionIcon variant="subtle" size="lg" onClick={toggle}>
            <IconMenu2 color="white" />
          </ActionIcon>
        </div>
      </nav>

      <Collapse in={opened} className="md:hidden sticky top-12 z-50">
        <nav className="w-full flex flex-col bg-teal-600 px-4 py-2 shadow-xl">
          {navigation.map((item, index) => (
            <NavLink
              key={index}
              component={Link}
              href={item.url}
              label={item.name}
              leftSection={item.icon}
              className="text-white hover:bg-teal-700 rounded-md mb-1"
              active={
                (item.url === "/" && router.asPath === "/") ||
                router.asPath.startsWith(item.url)
              }
              onClick={() => toggle()}
            />
          ))}
        </nav>
      </Collapse>
    </>
  );
}
