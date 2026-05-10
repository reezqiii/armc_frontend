import {
  IconLayoutDashboard,
  IconListDetails,
  IconBuildingFactory,
  IconUserPlus,
} from "@tabler/icons-react";

const productionList = [
  {
    title: "Production & Quality",
    href: "/",
    active: "Production",
    icon: <IconBuildingFactory size={18} />,
    permission: 15,
    child: [
      {
        title: "Dashboard",
        href: "/production/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
        permission: 15,
      },
      {
        title: "Create Production",
        href: "/production/add_production",
        active: "Create Production",
        icon: <IconUserPlus size={18} />,
        permission: 30,
      },
      {
        title: "Production List",
        href: "/production/list", 
        active: "Production List",
        icon: <IconListDetails size={18} />,
        permission: [28, 29],
      },
    ],
  },
];

export default productionList;
