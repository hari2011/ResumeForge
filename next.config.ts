import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Prevent bundling of pdf-parse / pdfjs-dist so their worker paths stay intact.
  // sql.js ships a WASM binary that must stay external too, otherwise the bundler
  // tries to trace/inline it and can crash the build worker.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "sql.js"],
};

export default nextConfig;
