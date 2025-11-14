/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Désactiver l'optimisation des images pour Docker
  images: {
    unoptimized: true,
  },
  // Désactiver ESLint pendant le build Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver TypeScript errors pendant le build
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

