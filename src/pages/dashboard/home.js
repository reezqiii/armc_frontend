import React from "react";
import Head from "next/head";
import {Title} from "@mantine/core";
import AuthLayout from "@/components/layout/authLayout";
import useUser from "@/store/useUser";

export default function DashboardHome() {
  const { user } = useUser();

  return (
    <AuthLayout>
      <Head>
        <title>Home</title>
      </Head>

      <div className="min-h-[60vh] flex flex-col items-center justify-center p-xl">
        <Title order={1} className="text-gray-900 text-center">
          Welcome Back,{" "}
          <span className="text-blue-500">{user?.name || "User"}</span>
        </Title>
      </div>
    </AuthLayout>
  );
}
