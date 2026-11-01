/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/restoboom-site',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
