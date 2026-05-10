import {
  IconLayoutDashboard,
  IconListDetails,
  IconTools,
  IconUserPlus,
} from "@tabler/icons-react";

const engineeringList = [
  {
    title: "Engineering",
    href: "/",
    active: "Engineering",
    icon: <IconTools size={18} />,
    permission: 18,
    child: [
      {
        title: "Dashboard",
        href: "/engineering/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
        permission: 18,
      },
      {
        title: "Create Engineering",
        href: "/engineering/add_engineering",
        active: "Create Engineering",
        icon: <IconUserPlus size={18} />,
        permission: 19,
      },
      {
        title: "Engineering List",
        href: "/engineering/list",
        active: "Engineering List",
        icon: <IconListDetails size={18} />,
        permission: [25, 26],
      },
    ],
  },
];

export default engineeringList;
