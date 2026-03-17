import useUser from "@/store/useUser";
import { Button, Image } from "@mantine/core";
import { IconUser, IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import useSwal from "@/hooks/useSwal";
import React from "react";

export default function Header() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const { showAlert } = useSwal();

  const handleLogout = async () => {
    const result = await showAlert(
      "Logout",
      "question",
      "Are you sure you want to logout?",
      "Yes, Logout",
      true,
    );

    if (result.isConfirmed) {
      Cookies.remove("token");
      Cookies.remove("user_info");
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <header className="flex flex-col md:flex-row items-center md:justify-between py-8 px-8 bg-white border-b border-gray-100">
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/armc.png`}
          w={200}
          alt="logo"
        />
      </div>

      <div className="flex items-center">
        <Button
          variant="light"
          leftSection={<IconUser size={20} />}
          size="md"
          className="mr-2"
          color="teal"
        >
          {user?.name || "User"}
        </Button>

        <Button
          onClick={handleLogout}
          variant="filled"
          color="red"
          size="md"
          leftSection={<IconLogout size={20} />}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
