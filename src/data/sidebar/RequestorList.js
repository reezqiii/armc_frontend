import {
  IconListLetters,
  IconListDetails,
  IconUserPlus,
  IconFileText,
  IconUserCheck,
  IconUserCog,
  IconCircleCheck,
  IconUserExclamation,
  IconUserShield,
  IconRefresh,
  IconLayoutDashboard,
} from "@tabler/icons-react";

const currentStatus =
  typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("status")
    : null;

const isActive = (val) => currentStatus === val;

const requestorList = [
  {
    title: "PCMS Access Request",
    href: "/",
    active: "User Request",
    icon: <IconListDetails size={18} />,
    child: [
      {
        title: "Dashboard",
        href: "/user_request/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
      },
      {
        title: "User Request List",
        href: "/user_request/list/all",
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
        title: "Return Request",
        href: "/user_request/list/returned",
        active: "Return Request",
        icon: <IconRefresh size={18} />,
      },
      {
        title: "Draft",
        href: "/user_request/list/draft",
        active: "Draft",
        icon: <IconFileText size={18} />,
      },
      {
        title: "Pending HOD Request",
        href: "/user_request/list/awaiting-hod-approval",
        active: "Pending HOD Request",
        icon: <IconUserCheck size={18} />,
      },
      {
        title: "Pending Lead IT Request",
        href: "/user_request/list/awaiting-lead-it-approval",
        active: "Pending Lead IT Request",
        icon: <IconUserExclamation size={18} />,
      },
      {
        title: "Pending IT Mgr / Asst. IT Mgr",
        href: "/user_request/list/awaiting-it-manager-approval",
        active: "Pending IT Manager",
        icon: <IconUserCog size={18} />,
      },
      {
        title: "Completed",
        href: "/user_request/list/completed",
        active: "Completed",
        icon: <IconCircleCheck size={18} />,
      },
    ],
  },
];

if (true == true) {
  requestorList.push({
    title: "IT Action",
    href: "/",
    active: "Permission Request",
    icon: <IconUserShield size={18} />,
    requiredPermission: 2,
    child: [
      {
        title: "On Queue",
        href: "/admin/admin_list?status=onQueue",
        active: isActive("onQueue"),
        icon: <IconListLetters size={18} />,
        restricted: true,
      },
      {
        title: "On Progress",
        href: "/admin/admin_list?status=onProgress",
        active: isActive("onProgress"),
        icon: <IconUserPlus size={18} />,
        restricted: true,
      },
      {
        title: "Completed",
        href: "/admin/admin_list?status=completed",
        active: isActive("completed"),
        icon: <IconCircleCheck size={18} />,
        restricted: true,
      },
    ],
  });
}

// const filteredSidebar = requestorList.filter(menu => {
//   if (!menu.requiredPermission) return true;
//   return hasPermission(menu.requiredPermission);
// });

// export default filteredSidebar;

export default requestorList;
