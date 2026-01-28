// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CustomContextMenu from '@/components/CustomContextMenu';
import Footer from '@/components/Footer';
import Watermark from "@/components/WaterMark";
import MatomoTracker from '@/components/MatomoTracker';
import FloatingMenu from "@/components/FloatingMenu";

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
        <MatomoTracker />
        <CustomContextMenu>
          <Navbar /> 
          {children}
          <Watermark />
          <Footer /> 
        </CustomContextMenu>
        
        <FloatingMenu />
      </body>
    </html>
  );
}