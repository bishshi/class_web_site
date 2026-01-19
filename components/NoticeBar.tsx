// components/NoticeBar.tsx
import { Megaphone } from 'lucide-react';

interface NoticeBarProps {
  notices: string[];
}

export default function NoticeBar({ notices }: NoticeBarProps) {
  const displayNotices = notices.length > 0 ? notices : ["暂无最新公告..."];
  const isSingle = displayNotices.length === 1;

  return (
    <div className="w-full bg-yellow-50 border-y border-yellow-100 h-10 flex items-center overflow-hidden">
      {/* 1. 左侧固定标签 */}
      <div className="flex-shrink-0 px-4 flex items-center text-yellow-700 font-bold z-10 bg-yellow-50 h-full shadow-[4px_0_10px_rgba(254,249,195,1)]">
        <Megaphone size={16} className="mr-2" />
        <span className="text-sm whitespace-nowrap">公告</span>
      </div>
      
      {/* 2. 滚动/静态容器 */}
      <div className="flex-1 overflow-hidden h-full">
        <div className={`
          flex items-center h-full whitespace-nowrap
          animate-marquee-custom 
          ${isSingle ? 'lg:animate-none lg:translate-x-0' : ''} 
          hover:[animation-play-state:paused]
        `}>
          
          {/* 第一组内容 */}
          <div className="flex items-center min-w-full">
            {displayNotices.map((notice, idx) => (
              <span key={`a-${idx}`} className="mx-6 lg:mx-10 text-sm text-gray-700 font-medium">
                {notice}
              </span>
            ))}
          </div>
          
          {/* 第二组内容：仅在需要滚动时发挥作用（移动端或多条公告时） */}
          {/* lg:hidden 指的是在电脑端如果只有一条公告，就彻底隐藏第二组，防止看到重复 */}
          <div className={`flex items-center ${isSingle ? 'lg:hidden' : ''}`}>
            {displayNotices.map((notice, idx) => (
              <span key={`b-${idx}`} className="mx-6 lg:mx-10 text-sm text-gray-700 font-medium">
                {notice}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}