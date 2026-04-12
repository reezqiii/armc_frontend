import { IconLayoutDashboard, IconListDetails, IconTools } from "@tabler/icons-react";

const engineeringList = [
  {
    title: "Engineering",
    href: "/",
    active: "Engineering",
    icon: <IconTools size={18} />,
    child: [
      {
        title: "Dashboard",
        href: "/engineering/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
      },
      {
        title: "Engineering List",
        href: "/engineering/list",
        active: "Engineering List",
        icon: <IconListDetails size={18} />,
      },
    ],
  },
];

export default engineeringList;