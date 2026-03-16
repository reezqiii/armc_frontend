import {
  IconUserCog,
  IconBuildingSkyscraper,
  IconBriefcase,
  IconShield,
  IconKey,
} from "@tabler/icons-react";

const userList = [
  {
    title: "User Management",
    active: "User Management",
    icon: <IconUserCog size={18} />,
    child: [
      {
        title: "User List",
        href: "/user_management/user_list/list",
        active: "User List",
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Department",
        href: "/user_management/department/list",
        active: "Department",
        icon: <IconBuildingSkyscraper size={18} />,
      },
      {
        title: "Project",
        href: "/user_management/project/list",
        active: "Project",
        icon: <IconBriefcase size={18} />,
      },
      {
        title: "Role",
        href: "/user_management/role/list",
        active: "Role",
        icon: <IconShield size={18} />,
      },
      {
        title: "Permission",
        href: "/user_management/permission/list",
        active: "Permission",
        icon: <IconKey size={18} />,
      },
    ],
  },
];

export default userList;
