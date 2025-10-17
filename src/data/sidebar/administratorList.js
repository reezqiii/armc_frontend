import {
  IconListLetters,
  IconUserPlus,
} from '@tabler/icons-react';

export const administratorList = [
  {
    title: "User Management",
    href: "/",
    active: "User Management",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "User List",
        href: "/",
        active: "User List",
        icon: <IconListLetters size={18} />,
      },
      {
        title: "Create User",
        href: "/",
        active: "Create User",
        icon: <IconUserPlus size={18} />,
      },
    ],
  },
];
