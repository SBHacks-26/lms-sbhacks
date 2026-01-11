import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/submissions/:id/transcript',
        destination: 'http://127.0.0.1:5000/api/submissions/:id/transcript',
      },
    ];
  },
};

export default nextConfig;
