"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Check, Copy, X } from "lucide-react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 获取当前 URL (处理 SSR)
  const url = typeof window !== "undefined" ? window.location.href : "";

  // 核心逻辑：处理点击分享按钮
  const handleShareClick = async () => {
    // 1. 优先尝试调用系统原生分享 API (通常用于移动端)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: document.title, // 获取当前页面标题
          text: "这里有一个很棒的内容分享给你", // 可选的分享文本
          url: url,
        });
        // 如果成功唤起分享，直接返回，不打开下拉框
        return; 
      } catch (error) {
        // 用户取消分享或 API 调用失败（此时可以选择降级到打开下拉框，也可以什么都不做）
        console.log("分享被取消或失败", error);
        // 如果你希望在原生分享失败/取消时打开下拉框，可以在这里调用 setOpen(!open);
        return; 
      }
    }

    // 2. 桌面端或不支持原生分享的环境：切换自定义下拉框显示
    setOpen(!open);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        onClick={handleShareClick} // 这里改为调用新的处理函数
        className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
      >
        <Share2 className="h-4 w-4" />
        分享
      </button>

      {/* 只有在 open 为 true 时显示。
         由于上面逻辑控制，移动端只要成功唤起原生分享，open 就不会变 true。
      */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg border p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">分享到</span>
            <X
              className="h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-600"
              onClick={() => setOpen(false)}
            />
          </div>

          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <a
              href={`https://service.weibo.com/share/share.php?url=${encodeURIComponent(
                url
              )}`}
              target="_blank"
              className="flex flex-col items-center hover:text-red-500"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                微
              </div>
              微博
            </a>

            <a
              href={`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(
                url
              )}`}
              target="_blank"
              className="flex flex-col items-center hover:text-blue-500"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                Q
              </div>
              QQ
            </a>

            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                url
              )}`}
              target="_blank"
              className="flex flex-col items-center hover:text-green-600"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                微
              </div>
              微信
            </a>

            <button
              onClick={handleCopy}
              className="flex flex-col items-center hover:text-slate-900"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </div>
              {copied ? "已复制" : "复制"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}