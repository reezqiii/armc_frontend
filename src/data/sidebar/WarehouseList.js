import { IconLayoutDashboard, IconPackages, IconBoxSeam } from "@tabler/icons-react";

const warehouseList = [
  {
    title: "Warehouse",
    href: "/",
    active: "Warehouse",
    icon: <IconPackages size={18} />,
    child: [
      {
        title: "Dashboard",
        href: "/warehouse/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
      },
      {
        title: "Warehouse List",
        href: "/warehouse/list",
        active: "Warehouse",
        icon: <IconBoxSeam size={18} />,
      },
    ],
  },
];

export default warehouseList;