import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Moved outside of "experimental"
  serverExternalPackages: ["bcrypt", "tar", "@mapbox/node-pre-gyp"],

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

    // 👇 Add this to handle .html files in node_modules
    config.module.rules.push({
      test: /\.html$/,
      use: ["raw-loader"],
      exclude: /app|pages/, // Prevents conflicts with your own HTML files if any
    });

    return config;
  },
};

export default nextConfig;
