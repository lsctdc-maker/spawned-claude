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
    if (isServer) {
      config.externals.push('canvas');
    }

    return config;
  },
};

module.exports = nextConfig;
