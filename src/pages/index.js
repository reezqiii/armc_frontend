import AuthLayout from "@/components/layout/authLayout";
import Head from "next/head";
import useUser from "@/store/useUser";
import React from "react";

export default function Index() {
  const { user } = useUser();

  return (
    <AuthLayout>
      <Head>
        <title>Home - ARMC</title>
      </Head>

      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-teal-600 mb-2">
            Welcome, {user?.name}! 👋
          </h1>
        </div>
      </div>
    </AuthLayout>
  );
}