'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

// 模拟轮播数据，后续可从 Strapi 接口获取
const SLIDES = [
  { id: 1, src: '/images/banner1.jpg', title: '高三(2)班 运动会合影' }, // 记得在 public/images 放几张测试图
  { id: 2, src: '/images/banner2.jpg', title: '春游踏青活动' },
  { id: 3, src: '/images/banner3.jpg', title: '期末表彰大会' },
];

export default function HomeCarousel() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((curr) => (curr === 0 ? SLIDES.length - 1 : curr - 1));
  const next = () => setCurrent((curr) => (curr === SLIDES.length - 1 ? 0 : curr + 1));

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden group">
      {/* 图片层 */}
      <div 
        className="flex transition-transform duration-500 ease-out h-full" 
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0 relative h-full bg-gray-200">
            {/* 如果你用的是外部图床，记得在 next.config.js 配置域名，或者先用 div 占位 */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-100">
               {/* 实际使用时替换为 <Image /> */}
               <span className="text-2xl font-bold">{slide.title}</span>
            </div>
            
            {/* 标题遮罩 */}
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 md:p-8">
              <h2 className="text-white text-xl md:text-3xl font-bold">{slide.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 左右按钮 */}
      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <ChevronLeft size={24} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 p-2 rounded-full text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <ChevronRight size={24} />
      </button>

      {/* 指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <div 
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${current === i ? 'bg-white w-6' : 'bg-white/50'}`} 
          />
        ))}
      </div>
    </div>
  );
}