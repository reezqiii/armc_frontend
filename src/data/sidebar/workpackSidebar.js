import { IconList, IconListLetters, IconPlus, IconStackPush } from "@tabler/icons-react";

export const workpackSidebar = [
  {
    title: "Create New Workpack",
    href: "/workpack/create",
    icon: <IconPlus size={18} />,
  },
  {
    title: "Workpack List",
    href: "/workpack",
    icon: <IconList size={18} />,
  },
  //   {
  //     title: "TEST 2",
  //     href: "/hse",
  //     active: "Dashboard",
  //     icon: <IconNote size={18} />,
  //   },
  //   {
  //     title: "TEST 3",
  //     href: "",
  //     active: "Dashboard",
  //     icon: <IconNote size={18} />,
  //     child: [
  //       {
  //         title: "TEST 3.1",
  //         href: "/test31",
  //         active: "Dashboard",
  //         icon: <IconNote size={18} />,
  //       },
  //     ],
  //   },
  {
    title: "Master Data",
    href: "",
    active: "Master",
    icon: <IconListLetters size={18} />,
    child: [
      {
        title: "Job No",
        href: "/workpack/job_no",
        active: "Job No",
        icon: <IconStackPush size={18} />,
      },
      {
        title: "Job Desc",
        href: "/workpack/job_desc",
        active: "Job Desc",
        icon: <IconStackPush size={18} />,
      },
    ],
  },
];
