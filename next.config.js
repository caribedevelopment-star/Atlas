/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Permite completar el build en Vercel incluso con errores de formato/ESLint
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
