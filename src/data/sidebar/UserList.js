import {
  IconUserCog,
  IconBuildingSkyscraper,
  IconBriefcase,
  IconShield,
  IconKey,
  IconLayoutDashboard,
  IconUserCheck,
} from "@tabler/icons-react";

const userList = [
  {
    title: "User Management",
    active: "/",
    icon: <IconUserCog size={18} />,
    permission: 40,
    child: [
      {
        title: "Dashboard",
        href: "/user_management/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
        permission: 40,
      },
      {
        title: "Account User List",
        href: "/user_management/user_list/list",
        active: "User List",
        icon: <IconUserCog size={18} />,
        permission: 1,
      },
      {
        title: "Department List",
        href: "/user_management/department/list",
        active: "Department",
        icon: <IconBuildingSkyscraper size={18} />,
        permission: 4,
      },
      {
        title: "Project List",
        href: "/user_management/project/list",
        active: "Project",
        icon: <IconBriefcase size={18} />,
        permission: 5,
      },
      {
        title: "Position List",
        href: "/user_management/position/list",
        active: "Position",
        icon: <IconUserCheck size={18} />,
        permission: 3,
      },
      {
        title: "Role List",
        href: "/user_management/role/list",
        active: "Role",
        icon: <IconShield size={18} />,
        permission: 2,
      },
      {
        title: "Permission List",
        href: "/user_management/permission/list",
        active: "Permission",
        icon: <IconKey size={18} />,
        permission: 6,
      },
    ],
  },
];

export default userList;
