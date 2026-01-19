// components/NoticeBar.tsx
import { Megaphone } from 'lucide-react';

// 定义接口，只接收纯字符串数组，保持组件简单
interface NoticeBarProps {
  notices: string[];
}

export default function NoticeBar({ notices }: NoticeBarProps) {
  // 如果没有公告，显示默认占位符或返回 null 隐藏
  const displayNotices = notices.length > 0 
    ? notices 
    : ["暂无最新公告..."];

  return (
    <div className="w-full bg-yellow-50 border-y border-yellow-100 h-12 flex items-center overflow-hidden">
      <div className="flex-shrink-0 px-4 flex items-center text-yellow-700 font-bold z-10 bg-yellow-50 h-full shadow-[4px_0_8px_rgba(255,255,255,1)]">
        <Megaphone size={18} className="mr-2" />
        <span>公告</span>
      </div>
      
      <div className="flex-1 overflow-hidden relative group">
        <div className="whitespace-nowrap animate-marquee flex items-center">
          {/* 重复数据以实现无缝滚动 */}
          {[...displayNotices, ...displayNotices].map((notice, index) => (
            <span key={index} className="mx-8 text-sm text-gray-700 font-medium inline-block">
              {notice}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}