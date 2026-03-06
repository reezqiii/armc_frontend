import {
  IconUserShield,
  IconUserCheck,
  IconUserX,
  IconLock,
  IconUserCog,
} from "@tabler/icons-react";

const userList = [
  {
    title: "User Management",
    active: "User Management",
    icon: <IconUserCog size={18} />,
    child: [
      {
        title: "Users List",
        href: "/user_management/user_list/active",
        active: "Active Users List",
        icon: <IconUserCheck size={18} />,
      },
      // {
      //   title: "Inactive Users",
      //   href: "/user_management/user_list/inactive",
      //   active: "Inactive Users List",
      //   icon: <IconUserX size={18} />,
      // },
      // {
      //   title: "Locked Users",
      //   href: "/user_management/user_list/locked",
      //   active: "Locked Users List",
      //   icon: <IconLock size={18} />,
      // },
    ],
  },
];

export default userList;
