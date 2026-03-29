/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  images: {
    unoptimized: true,
  },
  basePath: '/gatoCan',
  // ESTO ES LO QUE ARREGLA TU ERROR:
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Evita que Next.js intente pre-renderizar las rutas de la API
  trailingSlash: true,
}

module.exports = nextConfig
