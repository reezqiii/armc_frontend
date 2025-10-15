import { IconNote, IconDownload, IconHome, IconList, IconUpload, IconChecklist, IconSubtask, IconListLetters, IconGps, IconMapPinPlus, IconAtom2, IconAtom2Filled } from "@tabler/icons-react";

export const exampleList = [
  {
    title: "TEST A",
    href: "/example",
    show : true,
    active: "Dashboard",
    icon: <IconNote size={18} />,
  },
  {
    title: "TEST 2",
    href: "/hse",
    show : true,
    active: "Dashboard",
    icon: <IconNote size={18} />,
  },
  {
    title: "TEST 3",
    href: "",
    show : true,
    active: "Dashboard",
    icon: <IconNote size={18} />,
    child: [
      {
        title: "TEST 3.1",
        href: "/test31",
        show : true,
        active: "Dashboard",
        icon: <IconNote size={18} />,
      },
      {
        title: "TEST 3.2",
        href: "/test32",
        show : true,
        active: "Dashboard",
        icon: <IconNote size={18} />,
      },
    ],
  },
];

export const workpackSidebarList = [
  {
    title: "Dashboard",
    href: "/workpack",
    show : true,
    active: "/workpack",
    icon: <IconHome size={18} />,
  },
  {
    title: "Workpack List",
    href: "/workpack/list",
    show : true,
    active: "/workpack/list",
    icon: <IconList size={18} />,
  },
  {
    title: "Import Checklist",
    href: "/workpack/import",
    show : true,
    active: "/workpack/import",
    icon: <IconUpload size={18} />,
  },
  {
    title: "Export Excel",
    href: "/workpack/export",
    show : true,
    active: "/workpack/export",
    icon: <IconDownload size={18} />,
  },
  {
    title: "Master Data",
    href: "",
    active: "Master",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Job No",
        href: "/master-data/job_no",
        active: "Job No",
        icon: <IconAtom2 size={18} />,
      },
      {
        title: "Job Desc",
        href: "/master-data/job_desc",
        active: "Job Desc",
        icon: <IconAtom2Filled size={18} />,
      },
    ],
  },
];

export const checklistSidebarList = [
  // {
  //   title: "Dashboard",
  //   href: "/checklist",
  //   show : true,
  //   active: "/checklist",
  //   icon: <IconHome size={18} />,
  // },
  // {
  //   title: "Mechanical Completion List",
  //   href: "/checklist/list",
  //   show : true,
  //   active: "/checklist/list",
  //   icon: <IconList size={18} />,
  // },
  
  {
    title: "Production RFI",
    href: "/checklist/production_rfi",
    show : true,
    active: "/checklist/production_rfi",
    icon: <IconSubtask size={18} />,
  },


 
  // {
  //   title: "Import Checklist",
  //   href: "/checklist/import",
  //   active: "/checklist/import",
  //   icon: <IconUpload size={18} />,
  // },
  {
    title: "Inspection RFI",
    href: "",
    show : true,
    active: "#",
    icon: <IconList size={18} />,
    child: [
      {
        title: "Inspection List",
        href: "/checklist/inspection_list",
        show : true,
        active: "/checklist/inspection_list",
        icon: <IconChecklist size={18} />,
      },
     
    ],
  },

 {
    title: "Transmittal RFI",
    href: "/checklist/transmit_itr",
    active: "/checklist/list",
    icon: <IconList size={18} />,
  },

  {
    title: "Client RFI",
    href: "",
    show : true,
    active: "#",
    icon: <IconList size={18} />,
    child: [
      {
        title: "Inspection List",
        href: "/itr/",
        show : true,
        active: "/itr/",
        icon: <IconChecklist size={18} />,
      },
     
    ],
  },

  {
    title: "Export Excel",
    href: "/checklist/export",
    show : true,
    active: "/checklist/export",
    icon: <IconDownload size={18} />,
  },

];

export const templateSidebarList = [
  {
    title: "Tag Number List",
    href: "/template",
    show : true,
    active: "/template/list",
    icon: <IconList size={18} />,
  },
  {
    title: "Import Tag List",
    href: "/template/import",
    show : true,
    active: "/template/import",
    icon: <IconUpload size={18} />,
  },
  {
    title: "Export Excel",
    href: "/template/export",
    show : true,
    active: "/template/export",
    icon: <IconDownload size={18} />,
  },
];

export const itrSidebarList = [
  {
    title: "Dashboard",
    href: "/itr",
    active: "/itr",
    icon: <IconHome size={18} />,
  },
  {
    title: "ITR Client List",
    href: "/itr/list",
    active: "/itr/list",
    icon: <IconList size={18} />,
  },
  {
    title: "Import Excel",
    href: "/itr/import",
    active: "/itr/import",
    icon: <IconUpload size={18} />,
  },
  {
    title: "Export Excel",
    href: "/itr/export",
    active: "/itr/export",
    icon: <IconDownload size={18} />,
  },
];