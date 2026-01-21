'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import SearchModal from './SearchModel';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false); // 新增滚动状态

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20); // 滚动超过20px时触发
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NAV_ITEMS = [
    { name: '首页', href: '/' },
    { name: '教师风采', href: '/category/Teacher' },
    { name: '学生风采', href: '/category/Student' },
    { name: '班级活动', href: '/category/Event' },
    { name: '特别策划', href: '/category/SpecialEvent' },
    { name: '学生档案', href: '/students' },
    { name: '师资力量', href: '/teachers' },
    { name: '联系我们', href: '/contact' },
  ];

  // 根据滚动状态动态 class
  const navbarClass = scrolled
    ? 'bg-white/50 backdrop-blur-lg bg-gradient-to-b from-white/40 to-white/60 shadow-md'
    : 'bg-white/30 backdrop-blur-md bg-gradient-to-b from-white/20 to-white/40 shadow-sm';

  return (
    <nav className={`sticky top-0 z-50 border-b border-gray-100 transition-all duration-300 ${navbarClass}`}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
            Class 612
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex space-x-6 mr-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <SearchModal />

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-1"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-2 pt-2 pb-4 border-t border-gray-100
                          bg-white/30 backdrop-blur-md 
                          bg-gradient-to-b from-white/20 to-white/40
                          rounded-md shadow-sm">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 px-2 rounded font-medium text-gray-600 
                           hover:text-blue-600 hover:bg-white/20 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
