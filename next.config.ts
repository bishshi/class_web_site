import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pic.biss.click', // 👈 关键：改成你的图床域名
      },
      // 如果你用的是阿里云 OSS，可能是 'oss-cn-hangzhou.aliyuncs.com'
    ],
  },
};

export default nextConfig;