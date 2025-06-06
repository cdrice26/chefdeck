import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
