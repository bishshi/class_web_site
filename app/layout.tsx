// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CustomContextMenu from '@/components/CustomContextMenu';
import TypebotBubble from '@/components/TypebotBubble';
import Footer from '@/components/Footer';
import Watermark from "@/components/WaterMark";

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
          <Navbar /> 
          {children}
          <Watermark />
          <Footer /> 
        </CustomContextMenu>
        
        <TypebotBubble />
      </body>
    </html>
  );
}