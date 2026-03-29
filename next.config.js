/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  images: {
    unoptimized: true,
  },
  basePath: '/gatoCan',
  // Esto evita que el proceso se pare por errores de escritura (TypeScript)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
