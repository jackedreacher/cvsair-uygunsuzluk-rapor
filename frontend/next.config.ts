import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output helps with some deployment scenarios and reduces size
  output: "standalone",
  // Ensure trailing slashes are handled consistently
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : "http://localhost:3001/api/:path*",
      },
    ];
  },
};

export default nextConfig;
