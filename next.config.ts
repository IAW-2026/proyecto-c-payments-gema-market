import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
  allowedDevOrigins: ['uncouth-karate-large.ngrok-free.dev'],
};


export default nextConfig;
