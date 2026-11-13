import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/seller", destination: "/seller/dashboard", permanent: false },
      { source: "/admin", destination: "/admin/dashboard", permanent: false },
      { source: "/cart", destination: "/buyer/cart", permanent: false },
      { source: "/checkout", destination: "/buyer/checkout", permanent: false },
      { source: "/account", destination: "/buyer/dashboard", permanent: false },
      {
        source: "/account/:path*",
        destination: "/buyer/:path*",
        permanent: false,
      },
      {
        source: "/admin/shipping",
        destination: "/admin/settings/shipping",
        permanent: false,
      },
      { source: "/register/buyer", destination: "/register", permanent: false },
      {
        source: "/register/seller",
        destination: "/register?role=seller",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
