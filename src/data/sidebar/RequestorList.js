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
        href: "/user_request/requestor_list",
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
        href: "/user_request/draft_request",
        active: "Draft",
        icon: <IconFileStar size={18} />,
      },
      {
        title: "Pending HOD Request",
        href: "/user_request/hod_pending",
        active: "Pending HOD Request",
        icon: <IconUserCheck size={18} />,
      },
      {
        title: "Pending Lead IT Request",
        href: "/user_request/lead_it_pending",
        active: "Pending Lead IT Request",
        icon: <IconUserCheck size={18} />,
      },
      {
        title: "Pending IT Manager",
        href: "/user_request/it_hod_pending",
        active: "Pending IT Manager",
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Completed",
        href: "/user_request/completed_request",
        active: "Completed",
        icon: <IconCircleCheck size={18} />,
      },
    ],
  },

  {
    title: "Admin",
    href: "/",
    active: "Permission Request",
    icon: <IconUserShield size={18} />,
    child: [
      {
        title: "On Queue",
        href: "/",
        active: "Permission Request List",
        icon: <IconListLetters size={18} />,
      },
      {
        title: "On Progress",
        href: "/",
        active: "Create User Request",
        icon: <IconUserPlus size={18} />,
      },
      {
        title: "Completed",
        href: "/",
        active: "Draft",
        icon: <IconFileStar size={18} />,
      },
    ],
  },
];
