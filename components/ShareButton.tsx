"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Check, Copy, X } from "lucide-react";

export default function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 点击外部关闭
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
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
      >
        <Share2 className="h-4 w-4" />
        分享
      </button>

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
              href={`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}`}
              target="_blank"
              className="flex flex-col items-center hover:text-red-500"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">微</div>
              微博
            </a>

            <a
              href={`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}`}
              target="_blank"
              className="flex flex-col items-center hover:text-blue-500"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">Q</div>
              QQ
            </a>

            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`}
              target="_blank"
              className="flex flex-col items-center hover:text-green-600"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">微</div>
              微信
            </a>

            <button
              onClick={handleCopy}
              className="flex flex-col items-center hover:text-slate-900"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </div>
              {copied ? "已复制" : "复制"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
