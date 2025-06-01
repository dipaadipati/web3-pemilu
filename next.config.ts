import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
        serverComponentsExternalPackages: ['canvas', 'face-api.js']
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            // Untuk server-side, allow canvas
            config.externals.push({
                canvas: 'canvas'
            });
        } else {
            // Untuk client-side, ignore canvas dan face-api.js
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
                'face-api.js': false,
            };
        }
        return config;
    }
};

export default nextConfig;
