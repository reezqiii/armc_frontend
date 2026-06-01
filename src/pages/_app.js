import { useEffect, useState } from "react";
import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";
import Cookies from "js-cookie";
import Head from "next/head";
import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/charts/styles.css";
import axios from "axios";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { setUser, user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = Cookies.get("token");

      if (
        !token &&
        router.pathname !== "/login" &&
        !router.pathname.startsWith("/reset_password")
      ) {
        router.push("/login");
        setLoading(false);
        return;
      }

      if (user?.id) {
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_PORTAL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const userData = res.data;

          setUser({
            id: userData.id_user,
            name: userData.full_name,
            token: token,
            role: userData.role_name,
            role_id: userData.id_role,
            permission_ids: userData.permission_ids ?? [], 
            department: userData.department_name,
          });
        } catch (err) {
          console.error("Failed get user", err);
          Cookies.remove("token");
          router.push("/login");
        }
      }

      setLoading(false);
    };

    init();
  }, [router.pathname]);

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
