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
    child: [
      {
        title: "Dashboard",
        href: "/user_request/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
        // Tanpa permission: Semua role (termasuk Staff Biasa) bisa melihat
      },
      {
        title: "User Request List",
        href: "/user_request/list/all",
        active: "User Request List",
        icon: <IconListLetters size={18} />,
        // Tanpa permission: Semua role (termasuk Staff Biasa) bisa melihat
      },
      {
        title: "Create User Request",
        href: "/user_request/add_request",
        active: "Create User Request",
        permission: "request.create", // Hanya Requestor (dan Admin)
        icon: <IconUserPlus size={18} />,
      },
      {
        title: "Pending HOD Request",
        href: "/user_request/list/awaiting-hod-approval",
        active: "Pending HOD Request",
        permission: "request.create", // Disembunyikan dari Staff Biasa
        icon: <IconUserCheck size={18} />,
      },
      {
        title: "Pending IT Mgr / Asst. IT Mgr",
        href: "/user_request/list/awaiting-it-manager-approval",
        active: "Pending IT Manager",
        permission: "request.create", // Disembunyikan dari Staff Biasa
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Completed",
        href: "/user_request/list/completed",
        active: "Completed",
        permission: "request.create", // Disembunyikan dari Staff Biasa
        icon: <IconCircleCheck size={18} />,
      },
    ],
  },
];

export default requestorList;
