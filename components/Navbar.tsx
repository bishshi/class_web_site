'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, LogOut, User, ChevronDown } from 'lucide-react';
import FuseSearch from '@/components/Search';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsLoggedIn(true);
          setUsername(user.username || user.email || '用户');
        } catch (error) {
          console.error('解析用户信息失败:', error);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkAuth();

    // 监听 storage 事件，以便在其他标签页登录/注销时同步状态
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // 注销处理
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
    setShowUserMenu(false);
    window.location.href = '/';
  };

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

            <FuseSearch />

            {/* 登录/用户菜单 - 桌面端 */}
            <div className="hidden md:flex items-center gap-2">
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-gray-800 font-semibold">{username}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* 下拉菜单 */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href="/members"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <User size={18} className="text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                            <p className="text-xs text-gray-600 mt-0.5">查看个人中心</p>
                          </div>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} />
                        <span>注销登录</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all text-sm border border-blue-400/30"
                >
                  <LogIn size={16} />
                  <span>登录</span>
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-1"
                aria-label="切换菜单"
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
            
            {/* 登录/用户信息 - 移动端 */}
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    href="/members"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
                      <p className="text-xs text-gray-600">查看个人中心</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
                  >
                    <LogOut size={18} />
                    <span>注销登录</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md transition-all border border-blue-400/30"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn size={18} />
                  <span>登录</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}