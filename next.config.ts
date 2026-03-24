import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep Dyte's WASM packages out of server-side bundling
  serverExternalPackages: [
    '@dytesdk/react-web-core',
    '@dytesdk/react-ui-kit',
    '@dytesdk/web-core',
  ],
  // Silence the turbopack warning
  turbopack: {},
};

export default nextConfig;
