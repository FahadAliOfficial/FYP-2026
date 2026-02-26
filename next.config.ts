import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests to the FastAPI backend
        // This keeps everything on the same origin (localhost:3000),
        // eliminating cross-origin cookie and CORS issues entirely.
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        // Also proxy question-bank routes (not under /api prefix)
        source: "/question-bank/:path*",
        destination: `${BACKEND_URL}/question-bank/:path*`,
      },
      {
        // Also proxy curriculum routes
        source: "/curriculum/:path*",
        destination: `${BACKEND_URL}/curriculum/:path*`,
      },
    ];
  },
};

export default nextConfig;
