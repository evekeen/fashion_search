/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['picsum.photos'],
  },
  reactStrictMode: true,
  // Prevent potential recursive path issues during build
  poweredByHeader: false,
  // Reduce build complexity
  swcMinify: true,
  // Prevent micromatch stack overflow by manually excluding patterns
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Reduce graph complexity
    outputFileTracingExcludes: {
      '*': [
        'node_modules/**/*',
        '.git/**/*',
        '.next/cache/**/*',
      ],
    },
  },
}

module.exports = nextConfig
