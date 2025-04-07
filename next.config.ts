import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Moved outside of "experimental"
  serverExternalPackages: ["bcrypt"],

  // ✅ Webpack fallback for client-side
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        "aws-sdk": false,
        "mock-aws-s3": false,
        nock: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
