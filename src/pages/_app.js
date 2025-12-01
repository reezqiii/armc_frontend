import { useEffect, useState } from "react";
import { useCookie } from "../hooks/useCookie";
import { LoadingOverlay, MantineProvider, Paper } from "@mantine/core";
import { useRouter } from "next/router";
import AuthLayout from '@/components/layout/authLayout';
import useUser from "@/store/useUser";
import useEncrypt from "@/hooks/useEncrypt";
import useDecrypt from "@/hooks/useDecrypt";
import Cookies from "js-cookie";
import axios from "axios";
import Head from "next/head";

import "@/styles/globals.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import useApi from "@/hooks/useApi";

const COOKIE_EXPIRE_TIME = 86400;

export default function App({ Component, pageProps }) {
  const cookieUser = useCookie("portal_user_js");
  const { user, setUser } = useUser();
  const router = useRouter();
  const { encrypt } = useEncrypt();
  const { decrypt } = useDecrypt();
  const API = useApi()
  const API_URL = API.API_URL
  const PORTAL_API = API.LINK_PORTAL

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const validateUser = async (userId) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/validate`,
        {
          id_user: userId,
        }
      );

      if (data.success) {
        return data;
      }
    } catch (error) {
      console.error("Error validating user: ", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      if (!router.isReady) return;

      const { id, auth_user } = router.query;
      let idUser = null;

      if (cookieUser) {
        idUser = id;
      }

      console.log(idUser);

      if (auth_user) {
        // const encryptUserId = encrypt(id);
        const encryptUserId = auth_user;
        const isValidUser = await validateUser(encryptUserId);

        if (isValidUser) {
          Cookies.set("portal_user_js", encryptUserId, {
            expires: COOKIE_EXPIRE_TIME / 86400,
          });

          setUser({
            id: isValidUser.user.id,
            name: isValidUser.user.full_name,
            token: isValidUser.token,
            permissions: isValidUser.user.permissions,
          });

          setIsAuthenticated(true);
          router.push('/')
          return;
        } else {
          router.push(`${PORTAL_API}`);
        }
      } else {
        const cookieValue = Cookies.get("portal_user_js");

        if (!cookieValue) {
          router.push(`${PORTAL_API}`);
        } else {
          idUser = cookieValue;
        }
      }

      if (idUser) {
        const decryptUserId = decrypt(idUser);
        const isValidUser = await validateUser(idUser);

        if (isValidUser) {
          setUser({
            id: isValidUser.user.id,
            name: isValidUser.user.full_name,
            token: isValidUser.token,
            permissions: isValidUser.user.permissions,
          });

          setIsAuthenticated(true);
        } else {
          router.push(`${PORTAL_API}`);
        }
      }
    };

    initAuth();
  }, [cookieUser, router, setUser, API_URL]);
  // }, [cookieUser, setUser, decrypt, encrypt]);

  // if (!isAuthenticated) {
  //   return <div> Loading</div>;
  // }

  return (
    <>
      <MantineProvider>
        {!isAuthenticated}
        <>
          <Head>
            <title>
              {process.env.NEXT_PUBLIC_APP_NAME}
            </title>
          </Head>
          <LoadingOverlay visible={!isAuthenticated} />
        </>
        {isAuthenticated ? (
          <>
            <Head>
              <title>
                {Component.title ? Component.title : 'Default Title'} - {process.env.NEXT_PUBLIC_APP_NAME}
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
