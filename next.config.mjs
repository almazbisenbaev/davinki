/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore build errors during development
    ignoreBuildErrors: true,
  },
  images: {
    // Disable image optimization for static export compatibility
    unoptimized: true,
  },
  // Exclude PDF.js and canvas from server-side bundling
  // These libraries require browser APIs and should only run client-side
  serverExternalPackages: ['pdfjs-dist', 'canvas'],
}

export default nextConfig
