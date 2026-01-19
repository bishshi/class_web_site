"use client";
import { useState, useEffect } from 'react';
import { Megaphone } from 'lucide-react';

export default function NoticeBar({ notices }: { notices: string[] }) {
  const [index, setIndex] = useState(0);
  const displayNotices = notices.length > 0 ? notices : ["暂无最新公告..."];

  useEffect(() => {
    if (displayNotices.length <= 1) return;
    
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayNotices.length);
    }, 4000); // 每4秒切换一条
    
    return () => clearInterval(timer);
  }, [displayNotices]);

  return (
    <div className="w-full bg-yellow-50 border-y border-yellow-100 h-12 flex items-center overflow-hidden">
      <div className="flex-shrink-0 px-4 flex items-center text-yellow-700 font-bold z-20 bg-yellow-50 h-full">
        <Megaphone size={18} className="mr-2" />
        <span>公告</span>
      </div>
      
      <div className="flex-1 h-full relative px-4">
        {displayNotices.map((notice, i) => (
          <div
            key={i}
            className={`absolute inset-0 flex items-center transition-all duration-700 ease-in-out px-4
              ${i === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
          >
            <span className="text-sm text-gray-700 font-medium truncate">
              {notice}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}