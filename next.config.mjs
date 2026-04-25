/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/gifts-of-a-charitable-interpretation/',
        destination: '/being-charitable/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
