'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; // 1. 引入 Link

// 2. 更新接口定义，增加 link
export interface SlideItem {
  id: number;
  title: string;
  imageUrl: string;
  link?: string; // 这是一个可选属性
}

interface HomeCarouselProps {
  slides: SlideItem[];
}

export default function HomeCarousel({ slides }: HomeCarouselProps) {
  const [current, setCurrent] = useState(0);

  // 如果没有数据，显示占位
  if (!slides || slides.length === 0) {
    return <div className="w-full h-[300px] md:h-[450px] bg-gray-200 flex items-center justify-center text-gray-500">暂无轮播图</div>;
  }

  const prev = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () => setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    // 只有当幻灯片数量大于1时才自动轮播
    if (slides.length > 1) {
      const timer = setInterval(next, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden group bg-gray-100">
      <div 
        className="flex transition-transform duration-500 ease-out h-full" 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => {
          // 3. 定义内部内容，方便复用
          const SlideContent = () => (
            <>
              <Image 
                src={slide.imageUrl}
                alt={slide.title}
                fill
                className="object-cover"
                priority={true}
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 md:p-8">
                <h2 className="text-white text-xl md:text-3xl font-bold">{slide.title}</h2>
              </div>
            </>
          );

          return (
            <div key={slide.id} className="w-full flex-shrink-0 relative h-full">
              {/* 4. 如果有链接，用 Link 包裹；如果没有，就只是普通 div */}
              {slide.link ? (
                <Link href={slide.link} className="block w-full h-full relative cursor-pointer">
                  <SlideContent />
                </Link>
              ) : (
                <div className="w-full h-full relative">
                  <SlideContent />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 按钮部分保持不变 */}
      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10">
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${current === i ? 'bg-white w-6' : 'bg-white/50'}`} 
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}