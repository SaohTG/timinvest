/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Désactiver l'optimisation des images pour Docker
  images: {
    unoptimized: true,
  },
  // Désactiver ESLint pendant le build Docker
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Désactiver TypeScript pendant le build Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration pour le mode production
  swcMinify: true,
}

module.exports = nextConfig

