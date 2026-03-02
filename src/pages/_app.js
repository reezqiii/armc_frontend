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
        const { data } = await axios.post(`${API.API_URL}/api/auth/validate`, {
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

    const PUBLIC_ROUTES = ["/public_request", "/armc/public_request"];
    const currentPath = window.location.pathname;

    if (PUBLIC_ROUTES.some((p) => currentPath.includes(p))) {
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    const encryptedId = router.query.user || Cookies.get("portal_user_js");

    if (!encryptedId) {
      router.push(API.LINK_PORTAL);
      return;
    }

    (async () => {
      const valid = await validateUser(encryptedId);

      if (!valid) {
        router.push(API.LINK_PORTAL);
        return;
      }

      Cookies.set("portal_user_js", encryptedId, {
        expires: COOKIE_EXPIRE_TIME / 86400,
      });

      setUser({
        id: valid.user.id,
        name: valid.user.full_name,
        token: valid.token,
        permissions: valid.user.permissions,
      });

      setIsAuthenticated(true);
      router.replace(pathname);
      setLoading(false);
    })();
  }, [router.isReady, router, API.LINK_PORTAL, validateUser, setUser, pathname]);

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
