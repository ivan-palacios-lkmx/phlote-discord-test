import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Handle SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
