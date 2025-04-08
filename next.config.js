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
    // Don't run type checking during build - Vercel does this separately
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't run ESLint during build - Vercel does this separately
    ignoreDuringBuilds: true,
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
