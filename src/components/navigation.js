import useEncrypt from "@/hooks/useEncrypt";
import { hasPermission } from "@/lib/permissionHelper";
import useCollapseStore from "@/store/useLayout";
import useUser from "@/store/useUser";
import { ActionIcon, Collapse, NavLink } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconUserCog,
  IconHome,
  IconMenu2,
  IconDeviceDesktop,
  IconFolderOpen,
  IconWifi,
  IconTerminal,
  IconDatabase,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useMemo } from "react";

export default function Navigation() {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const { toggleCollapse } = useCollapseStore();
  const { encrypt } = useEncrypt();
  const permissions = useUser((state) => state.user?.permissions);

  const buildJumpLink = useCallback(
    (targetUrl) => {
      if (!targetUrl) return "";
      return `${process.env.NEXT_PUBLIC_LINK_PORTAL}/jump_url/redirect_v2/${encrypt(
        targetUrl,
      )}`;
    },
    [encrypt],
  );

  const IT_FORM = process.env.NEXT_PUBLIC_IT_FORM;

  const navigation = [
    {
      name: "Home",
      target: `${IT_FORM}/home/home`,
      icon: <IconHome size={20} />,
      external: true,
    },
    {
      name: "Computer & Account",
      target: `${IT_FORM}/computer_account/computer_account_list`,
      icon: <IconDeviceDesktop size={20} />,
      external: true,
    },
    {
      name: "Cross Dept. Share Folder Access",
      target: `${IT_FORM}/access_multi_share_folder/access_multi_share_folder`,
      icon: <IconFolderOpen size={20} />,
      external: true,
    },
    {
      name: "Wifi Access",
      target: `${IT_FORM}/Wifi_access/wifi_access`,
      icon: <IconWifi size={20} />,
      external: true,
    },
    {
      name: "Software Development",
      target: `${IT_FORM}/software_request/software_request`,
      icon: <IconTerminal size={20} />,
      external: true,
    },
    {
      name: "UAT",
      target: `${IT_FORM}/uat_app/master_app`,
      icon: <IconDatabase size={20} />,
      external: true,
    },
    {
      name: "PCMS Access Request",
      url: "/user_request/list/all",
      icon: <IconUser size={20} />,
    },
    {
      name: "User Management",
      url: "/user_management/user_list/active",
      icon: <IconUserCog size={20} />,
      permission: 2,
    },
  ];

  const filteredNavigation = useMemo(() => {
    return navigation.filter(
      (item) => !item.permission || hasPermission(item.permission),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions]);

  const items = filteredNavigation.map((item, index) => {
    const href = item.external ? buildJumpLink(item.target) : item.url;

    if (!href) return null;

    const isActive =
      !item.external &&
      ((href === "/" && router.asPath === "/") ||
        (href !== "/" && router.asPath.startsWith(href)));

    const content = (
      <>
        <div className="mr-2">{item.icon}</div>
        {item.name}
      </>
    );

    return (
      <div key={index} className="w-fit text-white">
        {item.external ? (
          <a
            href={href}
            className="p-2 hover:bg-white hover:text-black rounded-md text-sm flex"
          >
            {content}
          </a>
        ) : (
          <Link
            href={href}
            className={`p-2 ${
              isActive ? "bg-white bg-opacity-25 text-white" : ""
            } hover:bg-white hover:text-black rounded-md text-sm flex`}
          >
            {content}
          </Link>
        )}
      </div>
    );
  });

  return (
    <>
      <nav className="w-full sticky md:relative top-0 z-50 flex items-center justify-between bg-blue-600 px-4">
        <div className="flex">
          <ActionIcon
            variant="subtle"
            size="xl"
            className="mr-2"
            onClick={toggleCollapse}
          >
            <IconMenu2 color="white" />
          </ActionIcon>

          <div className="hidden md:flex gap-1 items-center">{items}</div>
        </div>
      </nav>

      <Collapse in={opened} className="md:hidden sticky top-10 z-50">
        <nav className="w-full flex flex-col bg-blue-600 px-4 py-1">
          {filteredNavigation.map((item, index) => {
            const href = item.external ? buildJumpLink(item.target) : item.url;

            if (!href) return null;

            return (
              <div key={index} className="text-white">
                <NavLink
                  component={item.external ? "a" : Link}
                  href={href}
                  label={item.name}
                  leftSection={item.icon}
                  variant="subtle"
                />
              </div>
            );
          })}
        </nav>
      </Collapse>
    </>
  );
}
