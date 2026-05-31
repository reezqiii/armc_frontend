import {
  IconListLetters,
  IconListDetails,
  IconUserPlus,
  IconFileText,
  IconUserCheck,
  IconUserCog,
  IconCircleCheck,
  IconLayoutDashboard,
} from "@tabler/icons-react";

const requestorList = [
  {
    title: "Access Request",
    href: "/",
    active: "User Request",
    icon: <IconListDetails size={18} />,
    permission: 7,
    child: [
      {
        title: "Dashboard",
        href: "/user_request/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
        permission: 7,
      },
      {
        title: "User Request List",
        href: "/user_request/list/all",
        active: "User Request List",
        icon: <IconListLetters size={18} />,
        permission: [11, 12],
      },
      {
        title: "Create User Request",
        href: "/user_request/add_request",
        active: "Create User Request",
        icon: <IconUserPlus size={18} />,
        permission: 8,
      },
      {
        title: "Pending HOD Request",
        href: "/user_request/list/awaiting-hod-approval",
        active: "Pending HOD Request",
        icon: <IconUserCheck size={18} />,
        permission: [8, 13],
      },
      {
        title: "Pending IT Mgr / Asst. IT Mgr",
        href: "/user_request/list/awaiting-it-manager-approval",
        active: "Pending IT Manager",
        icon: <IconUserCog size={18} />,
        permission: [8, 14],
      },
      {
        title: "Completed",
        href: "/user_request/list/completed",
        active: "Completed",
        icon: <IconCircleCheck size={18} />,
        permission: 7,
      },
    ],
  },
];

export default requestorList;
