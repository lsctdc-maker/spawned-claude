/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com'],
  },
  webpack: (config) => {
    // @imgly/background-removal ships ONNX Runtime as .mjs ESM files.
    // Tell webpack to treat them as proper ES modules so Terser doesn't choke
    // on import.meta.url inside them.
    config.module.rules.push({
      test: /\.mjs$/,
      type: 'javascript/esm',
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

module.exports = nextConfig;
