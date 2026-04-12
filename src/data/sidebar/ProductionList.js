import {
  IconLayoutDashboard,
  IconListDetails,
  IconBuildingFactory,
} from "@tabler/icons-react";

const productionList = [
  {
    title: "Production & Quality",
    href: "/",
    active: "Production",
    icon: <IconBuildingFactory size={18} />,
    child: [
      {
        title: "Dashboard",
        href: "/production/dashboard",
        active: "Dashboard",
        icon: <IconLayoutDashboard size={18} />,
      },
      {
        title: "Production List",
        href: "/production/list", 
        active: "Production List",
        icon: <IconListDetails size={18} />,
      },
    ],
  },
];

export default productionList;
