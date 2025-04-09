import type { NextConfig } from "next";
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcrypt", "tar", "@mapbox/node-pre-gyp"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // 👈 Skip type errors during `next build`
  },
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
        path: false,
        os: false,
        url: false,
        assert: false,
        util: false,
        stream: false,
        buffer: false,
        events: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
      };
    }

    config.module.rules.push({
      test: /\.html$/,
      use: ["raw-loader"],
      exclude: /app|pages/,
    });

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
