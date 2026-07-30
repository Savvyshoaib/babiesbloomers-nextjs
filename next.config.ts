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
  async headers() {
    // Never immutable-cache hashed assets in development — Turbopack
    // reuses chunk URLs and long-lived Cache-Control leaves storefront CSS stale.
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/_next/static/:path*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-store, must-revalidate",
            },
          ],
        },
      ];
    }

    return [
      {
        // Hashed Next assets can stay cached long-term in production.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
