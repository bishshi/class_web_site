"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    // 获取当前浏览器地址栏的链接
    const url = window.location.href;
    
    // 写入剪贴板
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      // 2秒后恢复图标
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button 
      onClick={handleShare}
      className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 
        ${copied 
          ? "bg-green-100 text-green-700 hover:bg-green-200" 
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
        }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "已复制链接" : "分享文章"}
    </button>
  );
}