/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // Tambahkan blok eslint di bawah ini
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;