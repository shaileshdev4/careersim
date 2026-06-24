/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@careersim/engine"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return [{ source: "/api/dramatize", destination: `${api}/api/dramatize` }];
  },
};

export default nextConfig;
