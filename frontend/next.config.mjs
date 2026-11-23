/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  images: {
    unoptimized: true,
  },

 async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination:
        `${process.env.INTERNAL_API_URL || "http://localhost:5000"}/api/:path*`,
    },
  ];
},
};

export default nextConfig;