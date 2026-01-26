import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Explicitly set turbopack root to the monorepo root to avoid Next's workspace-root inference warning.
  // The path is relative to this file (`apps/web/next.config.ts`) and points to the repository root.
  turbopack: {
    root: '../../'
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'akzddgyywobfumsfyqwy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/images/**',
        search: ''
      }
    ]
  }
};

export default nextConfig;
