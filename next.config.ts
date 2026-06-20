import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Prevent bundling of pdf-parse / pdfjs-dist so their worker paths stay intact
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
