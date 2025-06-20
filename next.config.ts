import type { NextConfig } from 'next';

// Configuration for Next.js
const nextConfig: NextConfig = {
  reactStrictMode: true, // Ensure this is explicitly true
  typescript: {
    ignoreBuildErrors: true, // Explicitly set
  },
  eslint: {
    ignoreDuringBuilds: true, // Explicitly set
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
<<<<<<< HEAD
  experimental: {
  },
  allowedDevOrigins: [
 'https://*-firebase-studio-*.cloudworkstations.dev',
 'https://*-firebase-studio-*.web.app',
 'https://9000-firebase-studio-1747135188719.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev',
 'http://192.168.1.107:9002',
 'http://192.168.0.245:9002',
 'http://192.168.0.245:3000'
 ],
||||||| parent of 1c0fdf2 (latest-jun182025)
  experimental: {
 allowedDevOrigins: [
 'https://*-firebase-studio-*.cloudworkstations.dev',
 'https://*-firebase-studio-*.web.app',
 'https://9000-firebase-studio-1747135188719.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev'
 ],
  },
=======
  experimental: {},
>>>>>>> 1c0fdf2 (latest-jun182025)
  // Adding a comment to ensure the file is seen as modified
  // Last attempt to force a clean rebuild for chunk loading issues.
};

export default nextConfig;
