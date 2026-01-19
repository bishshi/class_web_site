'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const NAV_ITEMS = [
    { name: '首页', href: '/' },
    { name: '师资力量', href: '/category/teacher' }, // 对应 Teacher
    { name: '学生风采', href: '/category/student' }, // 对应 Student
    { name: '班级活动', href: '/category/event' },   // 对应 Event
    { name: '特别策划', href: '/category/special-event' }, // 对应 SpecialEvent
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo / 班级名称 */}
          <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition">
            高三(2)班
          </Link>

          {/* 桌面端菜单 */}
          <div className="hidden md:flex space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 移动端下拉菜单 */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {NAV_ITEMS.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className="block py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-2 rounded"
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