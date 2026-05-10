import {
  IconLayoutDashboard,
  IconPackages,
  IconBoxSeam,
  IconUserPlus,
} from "@tabler/icons-react";

const warehouseList = [
  {
    title: "Warehouse",
    href: "/",
    active: "Warehouse",
    icon: <IconPackages size={18} />,
    permission: 20,
    child: [
      {
        title: "Dashboard",
        href: "/warehouse/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
        permission: 20,
      },
      {
        title: "Create Warehouse",
        href: "/warehouse/add_warehouse",
        active: "Create Warehouse",
        icon: <IconUserPlus size={18} />,
        permission: 36,
      },
      {
        title: "Warehouse List",
        href: "/warehouse/list",
        active: "Warehouse",
        icon: <IconBoxSeam size={18} />,
        permission: [34, 35],
      },
    ],
  },
];

export default warehouseList;
