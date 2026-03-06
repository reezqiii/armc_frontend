import { useEffect, useState } from "react";
import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";
import Cookies from "js-cookie";
import Head from "next/head";
import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    const userInfo = Cookies.get("user_info"); // Ambil string user dari cookie

    if (!token && router.pathname !== "/login") {
      router.push("/login");
      return;
    }

    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo); // Parse kembali menjadi objek

        // SYNC KEMBALI KE ZUSTAND
        // Gunakan properti yang sesuai agar 'name' di Header terisi
        setUser({
          id: parsedUser.id,
          name: parsedUser.full_name || parsedUser.name,
          token: token,
          permissions: parsedUser.permissions ?? [],
        });
      } catch (e) {
        console.error("Error parsing user info", e);
      }
    }

    setLoading(false);
  }, [router, setUser]);
  
  return (
    <MantineProvider>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME || "Portal TA"}</title>
      </Head>

      <LoadingOverlay visible={loading} />

      {!loading && <Component {...pageProps} />}
    </MantineProvider>
  );
}
