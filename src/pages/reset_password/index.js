import { useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  PasswordInput,
} from "@mantine/core";
import { motion } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { useRouter } from "next/router";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const API_URL = process.env.NEXT_PUBLIC_API_PORTAL;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!username || !email) return;

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot-password`, {
        username,
        email,
      });
      Swal.fire("Success", "Reset link has been sent to your email", "success");
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to send reset link",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    setPasswordError("");
    setConfirmError("");
    let isValid = true;

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        new_password: newPassword,
      });
      Swal.fire(
        "Success",
        "Password has been reset successfully",
        "success",
      ).then(() => {
        router.push("/login");
      });
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to reset password",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Paper radius="md" p="xl" shadow="lg" withBorder>
          {!token ? (
            <>
              <Title order={2} className="text-center text-teal-600 mb-2">
                Forgot Password
              </Title>
              <Text size="sm" className="text-center text-gray-500 mb-6">
                Enter your username and email to receive a password reset link
              </Text>
              <form onSubmit={handleForgot}>
                <Stack>
                  <TextInput
                    required
                    label="Username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    radius="md"
                    size="md"
                  />
                  <TextInput
                    required
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    radius="md"
                    size="md"
                  />
                  <Button
                    type="submit"
                    color="teal"
                    fullWidth
                    radius="md"
                    size="md"
                    loading={loading}
                  >
                    Send Reset Link
                  </Button>
                  <Button
                    variant="subtle"
                    color="gray"
                    fullWidth
                    onClick={() => router.push("/login")}
                  >
                    Back to Login
                  </Button>
                </Stack>
              </form>
            </>
          ) : (
            <>
              <Title order={2} className="text-center text-teal-600 mb-2">
                Create New Password
              </Title>
              <Text size="sm" className="text-center text-gray-500 mb-6">
                Enter your new password below
              </Text>
              <form onSubmit={handleReset}>
                <Stack>
                  <PasswordInput
                    required
                    label="New Password"
                    placeholder="Enter new password"
                    value={newPassword}
                    error={passwordError}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    radius="md"
                    size="md"
                  />
                  <PasswordInput
                    required
                    label="Confirm Password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    error={confirmError}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError("");
                    }}
                    radius="md"
                    size="md"
                  />
                  <Button
                    type="submit"
                    color="teal"
                    fullWidth
                    radius="md"
                    size="md"
                    loading={loading}
                  >
                    Save New Password
                  </Button>
                </Stack>
              </form>
            </>
          )}
        </Paper>
      </motion.div>
    </div>
  );
}

ResetPasswordPage.title = "Reset Password";
