/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { dev }) => {
    // On exFAT/removable drives webpack's filesystem cache snapshotting can fail.
    // Disabling the persistent cache avoids repeated warnings and occasional flaky output.
    if (dev) {
      config.cache = false;
      // First-time compiles on exFAT can be very slow; avoid client chunk timeouts.
      config.output = config.output || {};
      config.output.chunkLoadTimeout = 300000;
    }
    const firebaseRoot = path.dirname(require.resolve("firebase/package.json"));
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "firebase/app": path.join(firebaseRoot, "app/dist/esm/index.esm.js"),
      "firebase/auth": path.join(firebaseRoot, "auth/dist/esm/index.esm.js"),
      "firebase/firestore": path.join(firebaseRoot, "firestore/dist/esm/index.esm.js"),
      "firebase/storage": path.join(firebaseRoot, "storage/dist/esm/index.esm.js"),
    };
    return config;
  },
};

module.exports = nextConfig;
