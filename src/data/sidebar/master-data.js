import { IconListLetters, IconDatabaseExclamation, IconCertificate } from "@tabler/icons-react";

export const masterDataList = [
  {
    title: "Master Data",
    href: "/",
    active: "Master",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Master Data System",
        href: "/master_data/master_system/master_data_list",
        active: "master system",
        icon: <IconDatabaseExclamation size={18} />,
      },
      {
        title: "Master Data SubSystem",
        href: "/master_data_new/master_data_subsystem/subsystem_list",
        active: "master subsystem",
        icon: <IconDatabaseExclamation size={18} />,
      },
      {
        title: "Master Data ITR",
        href: "/master_data_new/master_data_itr/master_system",
        active: "master itr",
        icon: <IconCertificate size={18} />,
      },
    ],
  },


  // Tag Number Menu

  {
    title: "Tag Number",
    href: "/",
    active: "Tag",
    icon: <IconTag size={18} />,
    alwaysOpen:true,
    child: [
      {
        title: "Tag Number Register",
        href: "/master_data_new/tag_number/tag_register",
        active: "tag number register",
        icon: <IconRegistered size={18} />,
      },
      {
        title: "Tag Number import",
        href: "/scve",
        active: "tag number import",
        icon: <IconFileImport size={18} />,
      },
    ],
  },

  // ITR Menu

  {
    title: "ITR Assignment",
    href: "/",
    active: "Master",
    icon: <IconFavicon size={18} />,
    child: [
      {
        title: "Unassign ITR",
        href: "master_data_new/master_data_itr/itr_assignment/unassign_list",
        active: "Unassign ITR",
        icon: <IconSignLeftFilled size={18} />,
      },
      {
        title: "Assigned ITR",
        href: "/",
        active: "assigned ITR",
        icon: <IconCapProjecting size={18} />,
      },
    ],
  },

  // ITR Table production 

  {
    title: "ITR RFI",
    href: "/",
    active: "Master",
    icon: <IconFavicon size={18} />,
    child: [
      {
        title: "Production RFI",
        href: "/",
        active: "production RFI",
        icon: <IconBuilding size={18} />,
      },
      {
        title: "Inspection RFI",
        href: "/",
        active: "inspection RFI",
        icon: <IconFileCheck size={18} />,
      },
    ],
  },
]




    
      
      // {
      //   title: "Area",
      //   href: "/master-data/area",
      //   active: "Area",
      //   icon: <IconGps size={18} />,
      // },
      // {
      //   title: "Location",
      //   href: "/master-data/location",
      //   active: "Location",
      //   icon: <IconMapPinPlus size={18} />,
      // },
      // {
      //   title: "Point",
      //   href: "/master-data/point",
      //   active: "Point",
      //   icon: <IconGolf size={18} />,
      // },

