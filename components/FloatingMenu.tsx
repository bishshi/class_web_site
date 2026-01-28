"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, UserPlus, Plus } from 'lucide-react';
import Link from 'next/link';

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { 
      icon: <MessageSquareText size={18} />, 
      label: '问题反馈', 
      href: 'https://doc.biss.click/form/#/2/form/view/Fdz6QKko6E0gitjOCvTd4xopRFvQoEIBr0Lzx7tGfO0/',
      color: 'hover:text-amber-600'
    },
    { 
      icon: <UserPlus size={18} />, 
      label: '立即注册', 
      href: 'https://doc.biss.click/form/#/2/form/view/N5SlYfoeRM5INREbPzqJgpxw9ocdJub30k6UkX861nU/',
      color: 'hover:text-blue-600'
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="relative mb-4 w-40 overflow-visible"
          >
            {/* 方框列表容器 */}
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
              <div className="flex flex-col">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50 ${item.color} border-b border-gray-50 last:border-0`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* 气泡尖尖（小箭头） */}
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-gray-100 bg-white"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 悬浮球 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-45' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        <Plus size={28} />
      </button>
    </div>
  );
}