import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bjsvpbgieldumjywtfdm.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Next.js Server Actions payload can exceed default 1MB (e.g. admin content JSON).
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
