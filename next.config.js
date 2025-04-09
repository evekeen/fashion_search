/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  outputFileTracingExcludes: {
    '*': [
      'node_modules/**/*',
      '.git/**/*',
      '.next/cache/**/*',
    ],
  },
}

module.exports = nextConfig
