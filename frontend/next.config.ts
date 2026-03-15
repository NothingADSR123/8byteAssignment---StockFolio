import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
