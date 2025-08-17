/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://dostumkitabapp-backend-eu-47b73694c0c1.herokuapp.com/media/:path*'
          : 'http://127.0.0.1:8000/media/:path*',
      },
    ]
  },
}

export default nextConfig
