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
}

module.exports = nextConfig

