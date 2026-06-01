import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Group,
  Anchor,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import useSwal from "@/hooks/useSwal";
import { motion } from "framer-motion";
import axios from "axios";
import { useRouter } from "next/router";
import useUser from "@/store/useUser";

function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const { showAlert, showLoading, closeSwal } = useSwal();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const form = useForm({
    initialValues: { username: "", password: "" },
    validate: {
      username: (value) => (value.length < 1 ? "Username is required" : null),
      password: (value) => (value.length < 1 ? "Password is required" : null),
    },
  });
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (window.innerWidth <= 768 && !localStorage.getItem("pwaInstalled")) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
  }, []);

  const handleSubmit = async (values) => {
    showLoading("Authenticating...");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_PORTAL}/auth/login`,
        values,
      );

      if (res.data.token) {
        Cookies.set("token", res.data.token, { expires: 1 });

        setUser({
          id: res.data.user.id,
          name: res.data.user.full_name,
          token: res.data.token,
          role: res.data.user.role_name,
          role_id: res.data.user.role_id,
          permission_ids: res.data.user.permission_ids, 
          department: res.data.user.department_name,
        });

        closeSwal();
        await showAlert(
          "Success",
          "success",
          `Welcome back, ${res.data.user.full_name}!`,
          "Let's Go",
        );

        router.push("/");
      }
    } catch (err) {
      closeSwal();
      showAlert(
        "Access Denied",
        "error",
        err.response?.data?.message || "Invalid username or password",
        "Try Again",
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-200"
        >
          <Title order={2} className="text-center text-teal-500 mb-6">
            Sign In To Portal
          </Title>
          <Text size="sm" className="text-center text-gray-500 mb-6">
            Enter your username and password to access your account
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <TextInput
                required
                label="Username"
                placeholder="Enter your username"
                {...form.getInputProps("username")}
                radius="md"
                size="md"
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Enter your password"
                {...form.getInputProps("password")}
                radius="md"
                size="md"
              />

              <Group position="apart">
                <Anchor
                  size="sm"
                  c="teal"
                  onClick={() => router.push("/reset_password")}
                >
                  Forgot Password?
                </Anchor>
              </Group>

              <Button
                type="submit"
                radius="md"
                size="md"
                fullWidth
                color="teal"
              >
                Sign In
              </Button>
            </Stack>
          </form>

          
          {showInstallBanner && (
            <Text
              size="sm"
              className="mt-4 text-center text-teal-600 border-t border-teal-200 pt-3"
            >
              You can install this app to your device for a faster experience.
            </Text>
          )}
        </motion.div>
      </div>

      
      <div className="hidden lg:flex lg:w-1/2 bg-teal-900 items-center justify-center p-12 text-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg"
        >
          <Title
            order={1}
            className="text-6xl font-extrabold mb-6 leading-tight"
          >
            Welcome <span className="text-teal-400">Back.</span>
          </Title>

          <Text
            size="xl"
            className="text-blue-100 mb-8 opacity-90 leading-relaxed"
          >
            We are glad to see you again. Log in to continue managing your
            dashboard and access your latest updates.
          </Text>

          <div className="space-y-4 border-l-4 border-blue-500 pl-6">
            <Text italic className="text-lg text-blue-200">
              Efficiency is doing things right; effectiveness is doing the right
              things.
            </Text>
            <Text
              size="sm"
              className="font-semibold tracking-widest uppercase text-blue-400"
            >
              — PORTAL
            </Text>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

LoginPage.title = "Login";
export default LoginPage;
