import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 引入组件
import packageJson from "../package.json";
import CustomContextMenu from '@/components/CustomContextMenu'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Class 612 班级主页",
  description: "记录我们的青春岁月",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <CustomContextMenu>
        {/* 1. 放在这里，所有页面都会有导航条 */}
        <Navbar /> 
        
        {/* 2. 页面具体内容 */}
        {children}
        
        {/* 3. 你也可以在这里加一个 Footer 脚注 */}
        <footer className="bg-gray-50 text-center py-8 text-gray-400 text-sm mt-10">
          © 2026  Class 612 Website. Powered by BI. Using Next.js & Strapi.<br />
          Version: {packageJson.version} 
        </footer>
        </CustomContextMenu>
      </body>
    </html>
  );
}