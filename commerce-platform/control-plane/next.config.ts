import type { NextConfig } from 'next';

// Security-patched Next 15 stable: canary-only PPR and client-segment-cache
// experimental flags are intentionally disabled until officially supported.
const nextConfig:NextConfig={
  reactStrictMode:true
};
export default nextConfig;
