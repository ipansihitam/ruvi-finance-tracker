import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-eb9aa034-96ad-4d03-856f-02ada6d416df.space.z.ai',
    '.space.z.ai',
  ],
};

export default nextConfig;
