/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  webpack: (config, { isServer }) => {
    // @imgly/background-removal ships ONNX Runtime as .mjs ESM files.
    config.module.rules.push({
      test: /\.mjs$/,
      type: 'javascript/esm',
      resolve: { fullySpecified: false },
    });

    // fabric.js uses browser canvas — skip node-canvas on server
    // ag-psd + sharp are server-only native modules
    if (isServer) {
      config.externals.push('canvas', 'sharp');
    }

    return config;
  },
};

module.exports = nextConfig;
