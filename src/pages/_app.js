import { useCallback, useEffect, useState } from "react";
import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";
import Cookies from "js-cookie";
import axios from "axios";
import Head from "next/head";
import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import useApi from "@/hooks/useApi";
import { usePathname } from "next/navigation";
import "@mantine/charts/styles.css";

const COOKIE_EXPIRE_TIME = 86400;

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const { setUser } = useUser();
  const API = useApi();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const validateUser = useCallback(
    async (encryptedId) => {
      try {
        const { data } = await axios.post(`${API.API_URL}/auth/validate`, {
          id_user: encryptedId,
        });
        return data?.success ? data : null;
      } catch (e) {
        console.error("validate error:", e);
        return null;
      }
    },
    [API.API_URL],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const initAuth = async () => {
      const PUBLIC_ROUTES = ["/login/login"];
      if (PUBLIC_ROUTES.some((p) => pathname?.includes(p))) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      const token = Cookies.get("token");
      const userInfo = Cookies.get("user_info");

      if (!token || !userInfo) {
        router.push("/login/login");
        return;
      }

      const user = JSON.parse(userInfo);
      setUser({
        id: user.id,
        name: user.full_name,
        token: token,
        permissions: user.permissions ?? [],
      });

      setIsAuthenticated(true);
      setLoading(false);
    };

    initAuth();
  }, [router.isReady, pathname]);

  return (
    <>
      <MantineProvider>
        {!isAuthenticated}
        <>
          <Head>
            <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
          </Head>
          <LoadingOverlay visible={!isAuthenticated} />
        </>
        {isAuthenticated ? (
          <>
            <Head>
              <title>
                {Component.title ? Component.title : "Default Title"} -{" "}
                {process.env.NEXT_PUBLIC_APP_NAME}
              </title>
            </Head>
            <Component {...pageProps} />
          </>
        ) : (
          <></>
        )}
      </MantineProvider>
    </>
  );
}
