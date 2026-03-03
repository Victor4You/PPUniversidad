/** @type {import('next').NextConfig} */
const nextConfig = { 
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // basePath vacío asegura que Next no intente inyectar un dominio base
  basePath: '', 
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;