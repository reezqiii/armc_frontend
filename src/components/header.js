import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import useSwal from "@/hooks/useSwal";
import { Button, Title } from "@mantine/core";
import { IconLogout, IconUser } from "@tabler/icons-react";
import React from "react";
import Cookies from "js-cookie"; // Pastikan library js-cookie sudah terpasang
import { useRouter } from "next/router";
import Swal from "sweetalert2";

export default function Header() {
  const router = useRouter();
  const API = useApi();
  const LINK_PORTAL = API.LINK_PORTAL;
  const { showConfirm } = useSwal();
  const { user, setUser } = useUser();

  const handleLogout = () => {
    showConfirm(
      "Logout Confirmation",
      "Are you sure you want to exit the portal?",
    ).then((result) => {
      if (result.isConfirmed) {
        // Proses Hapus Session
        Cookies.remove("token");
        Cookies.remove("user_info");

        // Reset Zustand Store
        setUser({ id: 0, name: null, token: null, permissions: [] });

        // Redirect
        router.push("/login");
      }
    });
  };

  return (
    <header className="flex flex-col md:flex-row items-center md:justify-between py-8 px-8 bg-white border-b border-gray-100">
      <div>
        <Title order={2} className="text-blue-600 font-bold tracking-tighter">
          PORTAL
        </Title>
      </div>

      <div className="flex items-center">
        <Button
          variant="light"
          leftSection={<IconUser size={20} />}
          size="md"
          className="mr-2"
          color="blue"
        >
          {user?.name || "User"}
        </Button>

        <Button
          variant="filled"
          color="red"
          size="md"
          leftSection={<IconLogout size={20} />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
