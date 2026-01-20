"use client";

import { useEffect } from "react";
import Script from "next/script";

// 为了解决 TypeScript 报错，声明一下 window 上有 twikoo 对象
declare global {
  interface Window {
    twikoo: any;
  }
}

interface CommentSectionProps {
  envId: string; // 您的 Twikoo 环境 ID
  path?: string; // 当前文章的路径 (用于区分不同文章的评论)
}

export default function CommentSection({ envId, path }: CommentSectionProps) {
  
  // 核心初始化逻辑
  const initTwikoo = () => {
    if (window.twikoo) {
      window.twikoo.init({
        envId: envId,
        el: "#tcomment", // 挂载的 ID
        path: path || window.location.pathname, // 文章路径，重要！
        // 可以在这里加更多配置，比如 lang: 'zh-CN'
      });
    }
  };

  // 这里的 useEffect 确保在路由切换时（如果组件未卸载）也能重新激活
  useEffect(() => {
    initTwikoo();
  }, [path, envId]);

  return (
    <div className="mt-16 w-full">
      <h3 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">
        评论区
      </h3>
      
      {/* Twikoo 挂载点 */}
      <div id="tcomment"></div>

      {/* 加载 Twikoo 脚本 (使用 Next.js 优化策略) */}
      <Script
        src="https://cdn.staticfile.net/twikoo/1.6.39/twikoo.all.min.js"
        strategy="afterInteractive"
        onLoad={initTwikoo} // 脚本加载完自动初始化
      />
    </div>
  );
}