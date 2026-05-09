import { IconLayoutDashboard, IconPackages, IconBoxSeam, IconUserPlus } from "@tabler/icons-react";

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
        title: "Create Warehouse",
        href: "/warehouse/add_warehouse",
        active: "Create Warehouse",
        icon: <IconUserPlus size={18} />,
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