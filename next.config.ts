import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

// next-pwa uses webpack for service worker generation (production builds)
// Turbopack is used for dev mode only
export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
})(nextConfig);
