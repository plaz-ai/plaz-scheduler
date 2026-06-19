import type { NextConfig } from "next";

// GitHub Pages: served at /plaz-scheduler subpath
const basePath = '/plaz-scheduler';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
};

export default nextConfig;
