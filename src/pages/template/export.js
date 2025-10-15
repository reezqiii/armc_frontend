import AuthLayout from "@/components/layout/authLayout";
import React from "react";
import { Paper } from "@mantine/core";
import { templateSidebarList } from "../../data/sidebar/exampleList";
import useUser from "@/store/useUser";
import { useRouter } from "next/navigation";

Index.title = "Export Template";
export default function Index() {
  const router = useRouter();
  const { user } = useUser();

  return (
    <AuthLayout sidebarList={templateSidebarList}>
      <div className="py-6">
        <div className="max-w-full mx-auto sm:px-6 lg:px-8">
          <Paper p="sm" radius="sm" mt="md" withBorder>
            Index
          </Paper>
        </div>
      </div>
    </AuthLayout>
  );
}
