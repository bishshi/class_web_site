import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import packageJson from "../package.json";
import CustomContextMenu from '@/components/CustomContextMenu';
import TypebotBubble from '@/components/TypebotBubble';

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

  // 当 ISR 触发重新生成页面时，这行代码会重新执行，获取当前瞬间的时间
  const updateTime = new Date().toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai", // 强制使用北京时间，防止服务器在 UTC 时区
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <CustomContextMenu>
          <Navbar /> 
          
          {children}
          
          <footer className="bg-gray-50 text-center py-8 text-gray-400 text-sm mt-10">
            <div className="space-y-1">
                <p>© 2026 Class 612 Website. Powered by BI. Using Next.js & Strapi.</p>
                <p>
                    Version: v{packageJson.version} 
                    <span className="mx-2">|</span> 
                    {/* 显示最后更新时间 */}
                    Last Revalidate: {updateTime}
                </p>
            </div>
          </footer>
        </CustomContextMenu>
        
        <TypebotBubble />
      </body>
    </html>
  );
}