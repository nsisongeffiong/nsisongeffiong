import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
    ],
  },
  // Ensure trailing slashes match existing Ghost URLs
  trailingSlash: true,
}

export default nextConfig
