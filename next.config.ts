import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/profile-settings",
        destination: "/profile",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
