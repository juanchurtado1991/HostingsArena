import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rhwckutvymghagajcovs.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Tree-shake large icon/animation libraries — reduces JS bundle size significantly
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },
  serverExternalPackages: [
    '@remotion/bundler', 
    'remotion', 
    'esbuild',
    '@remotion/google-fonts',
    '@remotion/lottie',
    'music-metadata'
  ],
  // Enable gzip compression for all responses
  compress: true,
};

export default nextConfig;
