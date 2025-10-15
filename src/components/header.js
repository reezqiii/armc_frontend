import useApi from "@/hooks/useApi";
import useUser from "@/store/useUser";
import { Button, Image } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

export default function Header() {
  const { user }    = useUser();
  const API         = useApi()
  const LINK_PORTAL = API.LINK_PORTAL
  
  return (
    <header className="flex flex-col md:flex-row items-center md:justify-between py-8 px-8">
      <div>
        <Image
          src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logo_white.png`}
          w={200}
          alt="logo"
        />
      </div>

      <div className="flex items-center">
        <Button
          variant="filled"
          leftSection={<IconUser size={20} />}
          size="md"
          className="mr-2"
        >
          {user.name}
        </Button>
        <Button
          component={Link}
          href={LINK_PORTAL}
          variant="filled"
          color="red"
          size="md"
        >
          Portal
        </Button>
      </div>
    </header>
  );
}
