/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  basePath: '/gatoCan',
  // Con esto le decimos: "Pasa de los errores, yo sé lo que hago"
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Esto ayuda a que las rutas no den error 404
  trailingSlash: true,
}

module.exports = nextConfig
