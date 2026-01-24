'use client';

import { useState, useEffect, useRef } from 'react'; // 1. 引入 useRef
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export interface SlideItem {
  id: number;
  title: string;
  imageUrl: string;
  link?: string;
}

interface HomeCarouselProps {
  slides: SlideItem[];
}

export default function HomeCarousel({ slides }: HomeCarouselProps) {
  const [current, setCurrent] = useState(0);

  // --- 新增：用于记录触摸坐标的变量 ---
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  // ----------------------------------

  if (!slides || slides.length === 0) {
    return <div className="w-full h-[300px] md:h-[450px] bg-gray-200 flex items-center justify-center text-gray-500">暂无轮播图</div>;
  }

  const prev = () => setCurrent((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () => setCurrent((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  // --- 新增：触摸事件处理函数 ---
  
  // 1. 手指按下：记录起点
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  // 2. 手指移动：实时更新终点
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  // 3. 手指离开：计算距离并判断方向
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // 设置最小滑动距离（像素），防止误触

    // distance > 0 说明起点大于终点 -> 向左滑 -> 下一张
    if (distance > minSwipeDistance) {
      next();
    }
    // distance < 0 说明起点小于终点 -> 向右滑 -> 上一张
    else if (distance < -minSwipeDistance) {
      prev();
    }

    // 重置坐标，防止点击事件被误判为滑动
    touchEndX.current = 0;
    touchStartX.current = 0;
  };
  // ----------------------------

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(next, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  return (
    <div 
      className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden group bg-gray-100"
      // --- 新增：绑定触摸事件到最外层容器 ---
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      // ------------------------------------
    >
      <div 
        className="flex transition-transform duration-500 ease-out h-full" 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide) => {
          const SlideContent = () => (
            <>
              <Image 
                src={slide.imageUrl}
                alt={slide.title}
                fill
                className="object-cover pointer-events-none" // 建议：防止图片被拖拽干扰滑动
                priority={true}
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 md:p-8">
                <h2 className="text-white text-xl md:text-3xl font-bold">{slide.title}</h2>
              </div>
            </>
          );

          return (
            <div key={slide.id} className="w-full flex-shrink-0 relative h-full">
              {slide.link ? (
                // 这里的 Link 可能需要在手机端被拖动时阻止默认跳转，但在 Nextjs 中通常由于滑动很快，不会触发 Click
                <Link href={slide.link} className="block w-full h-full relative cursor-pointer select-none">
                  <SlideContent />
                </Link>
              ) : (
                <div className="w-full h-full relative select-none">
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
          {/* 这里可以加 hidden md:block 让箭头只在电脑端显示，手机端通常不需要箭头 */}
          <button onClick={prev} className="hidden md:block absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10">
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