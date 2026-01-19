import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 引入组件

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "高三(2)班班级主页",
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
        {/* 1. 放在这里，所有页面都会有导航条 */}
        <Navbar /> 
        
        {/* 2. 页面具体内容 */}
        {children}
        
        {/* 3. 你也可以在这里加一个 Footer 脚注 */}
        <footer className="bg-gray-50 text-center py-8 text-gray-400 text-sm mt-10">
          © 2026 高三(2)班 Class Website. Powered by SNext.
        </footer>
      </body>
    </html>
  );
}