/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['world.openfoodfacts.org', 'images.openfoodfacts.org'],
  },
  env: {
    NEXT_PUBLIC_API_URL: BACKEND_URL,
  },
  // Proxy /backend/* → FastAPI.  This means browser requests stay same-origin
  // (no CORS required) and the backend URL is never exposed.
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
