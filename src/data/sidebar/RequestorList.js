import {
  IconListLetters,
  IconListDetails,
  IconUserPlus,
  IconFileStar,
  IconUserCheck,
  IconUserCog,
  IconCircleCheck,
  IconDatabaseExclamation,
  IconUserShield,
} from '@tabler/icons-react';

export const requestorList = [
  {
    title: "User Request",
    href: "/",
    active: "User Request",
    icon: <IconListDetails size={18} />,
    child: [
      {
        title: "User Request List",
        href: "/",
        active: "User Request List",
        icon: <IconListLetters size={18} />,
      },
      {
        title: "Create User Request",
        href: "/user_request/add_request",
        active: "Create User Request",
        icon: <IconUserPlus size={18} />,
      },
      {
        title: "Draft",
        href: "/",
        active: "Draft",
        icon: <IconFileStar size={18} />,
      },
      {
        title: "Pending HOD Request",
        href: "/",
        active: "Pending HOD Request",
        icon: <IconUserCheck size={18} />,
      },
      {
        title: "Pending IT Manager",
        href: "/",
        active: "Pending IT Manager",
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Completed",
        href: "/",
        active: "Completed",
        icon: <IconCircleCheck size={18} />,
      },
    ],
  },

  {
    title: "Permission Request",
    href: "/",
    active: "Permission Request",
    icon: <IconUserShield size={18} />,
    child: [
      {
        title: "Permission Request List",
        href: "/",
        active: "Permission Request List",
        icon: <IconListLetters size={18} />,
      },
      {
        title: "Draft",
        href: "/",
        active: "Draft",
        icon: <IconFileStar size={18} />,
      },
      {
        title: "Pending HOD Request",
        href: "/",
        active: "Pending HOD Request",
        icon: <IconUserCheck size={18} />,
      },
      {
        title: "Pending IT Manager",
        href: "/",
        active: "Pending IT Manager",
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Completed",
        href: "/",
        active: "Completed",
        icon: <IconCircleCheck size={18} />,
      },
    ],
  },
];
