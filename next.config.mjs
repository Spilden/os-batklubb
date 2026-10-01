import { withPayload } from '@payloadcms/next/withPayload'
import { networkInterfaces } from 'node:os'

const localIps = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === 'IPv4' && !net.internal)
  .map((net) => net.address)

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [...localIps, '*.trycloudflare.com'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**.trycloudflare.com' }],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
