/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@careersim/engine"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
