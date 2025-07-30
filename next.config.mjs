/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove the deprecated serverActions option for Next.js 15
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
    unoptimized: true,
  },
}

export default nextConfig
