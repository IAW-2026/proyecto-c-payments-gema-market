import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  allowedDevOrigins: ['uncouth-karate-large.ngrok-free.dev'],
  cacheComponents: true,

  async rewrites() {
    return [
      {
        source: "/api/seller/:path*",
        destination: "/mock/api/seller/:path*",
      },
      {
        source: "/api/shipping/:path*",
        destination: "/mock/api/shipping/:path*",
      },
      {
        source: "/api/buyer/:path*",
        destination: "/mock/api/buyer/:path*",
      },
    ];
  },
};


export default nextConfig;
