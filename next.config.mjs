import { resolveBasePath } from "./lib/basePath.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // /restoboom-site in production; pull-request previews build under /restoboom-site/preview/pr-N.
  basePath: resolveBasePath(process.env.NEXT_PUBLIC_BASE_PATH),
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
