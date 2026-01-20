'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
// 1. 引入搜索组件 (请确保路径正确，如果在 components 目录下同级则用 ./)
import SearchModal from './SearchModel'; 

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const NAV_ITEMS = [
    { name: '首页', href: '/' },
    { name: '教师风采', href: '/category/Teacher' },
    { name: '学生风采', href: '/category/Student' },
    { name: '班级活动', href: '/category/Event' },
    { name: '特别策划', href: '/category/SpecialEvent' },
    { name: '学生档案', href: '/students' },
    { name: '师资力量', href: '/teachers' },
    { name: '问卷调查', href: '/survey' },
    { name: '联系我们', href: '/contact' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo / 班级名称 */}
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
            Class 612
          </Link>

          {/* 右侧功能区容器：包含 导航菜单 + 搜索 + 手机开关 */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* 桌面端菜单 (在中等屏幕以上显示) */}
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

            {/* 2. 插入搜索组件 (在手机和桌面都显示) */}
            <SearchModal />

            {/* 移动端菜单按钮 (仅手机显示) */}
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

        {/* 移动端下拉菜单内容 */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-2 rounded font-medium"
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