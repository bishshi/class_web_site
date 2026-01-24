'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // 引入传送门
import { Menu, X, LogIn, LogOut, User, ChevronDown, Clock } from 'lucide-react';
import FuseSearch from '@/components/Search';
import EventTimer from '@/components/EventTimer';
import WelcomeCard from '@/components/WelcomeCard';

type TimerData = {
  id: number;
  title: string;
  targetTime: string;
  isSpecial: boolean;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [mounted, setMounted] = useState(false); // 确保在客户端挂载
  const userMenuRef = useRef<HTMLDivElement>(null);

  // 0. 确保组件已挂载 (解决 Next.js Hydration 问题)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 滚动监听
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. 检查登录
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
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // 3. 获取倒计时
  useEffect(() => {
    const fetchTimers = async () => {
      try {
        const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
        const res = await fetch(`${STRAPI_URL}/api/timers?filters[isActive][$eq]=true&sort[0]=order:asc`);
        const json = await res.json();
        const timerData = json.data?.map((item: any) => ({
          id: item.id,
          title: item.title || "Event",
          targetTime: item.targetTime,
          isSpecial: item.isSpecial || false,
        })) || [];
        setTimers(timerData);
      } catch (error) {
        console.log("Navbar timer fetch optional");
      }
    };
    fetchTimers();
  }, []);

  // 4. 点击外部关闭 PC 菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // 5. 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUsername('');
    setShowUserMenu(false);
    setIsOpen(false);
    window.location.href = '/';
  };

  const NAV_ITEMS = [
    { name: '首页', href: '/' },
    { name: '教师风采', href: '/category/Teacher' },
    { name: '学生风采', href: '/category/Student' },
    { name: '班级活动', href: '/category/Event' },
    { name: '特别策划', href: '/category/SpecialEvent' },
    { name: '学生档案', href: '/students' },
    { name: '教师档案', href: '/teachers' },
    { name: '联系我们', href: '/contact' },
  ];

  const navbarClass = scrolled
    ? 'bg-white/50 backdrop-blur-lg bg-gradient-to-b from-white/40 to-white/60 shadow-md'
    : 'bg-white/30 backdrop-blur-md bg-gradient-to-b from-white/20 to-white/40 shadow-sm';

  return (
    <>
      {/* ================= Navbar 本体 ================= */}
      <nav className={`sticky top-0 z-40 border-b border-gray-100 transition-all duration-300 ${navbarClass}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition truncate mr-2">
              Class 612
            </Link>

            {/* PC端 导航 */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex space-x-6 mr-2">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href} className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base">
                    {item.name}
                  </Link>
                ))}
              </div>
              <FuseSearch />
              <div className="flex items-center gap-2">
                {isLoggedIn ? (
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 hover:border-blue-300 transition-all">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-800 font-semibold max-w-[100px] truncate">{username}</span>
                      <ChevronDown size={16} className={`text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                        <Link href="/members" onClick={() => setShowUserMenu(false)} className="block px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"><User size={18} className="text-white" /></div>
                              <div><p className="text-sm font-semibold">{username}</p><p className="text-xs text-gray-500">个人中心</p></div>
                           </div>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"><LogOut size={16} /><span>注销登录</span></button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/loginpage" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 text-white font-semibold shadow-md text-sm"><LogIn size={16} /><span>登录</span></Link>
                )}
              </div>
            </div>

            {/* 移动端 顶栏 */}
            <div className="md:hidden flex items-center gap-2 flex-1 justify-end">
              <div className="w-full max-w-[160px] xs:max-w-[200px] z-10">
                 <FuseSearch />
              </div>
              {isLoggedIn ? (
                 <Link href="/members" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm z-10"><User size={16} className="text-white" /></Link>
              ) : (
                <Link href="/loginpage" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors z-10"><LogIn size={20} /></Link>
              )}
              
              {/* 【开关按钮】只负责打开，因为抽屉现在是 Portal，打开后这个按钮可能被盖住，所以我们在抽屉里再放一个关闭按钮 */}
              <button
                onClick={() => setIsOpen(true)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 ml-1 z-10"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= Portal: 移动端全屏抽屉 ================= */}
      {/* 使用 createPortal 确保直接挂载到 body，突破所有 CSS 遮挡 */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden font-sans">
          
          {/* 1. 遮罩层 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* 2. 抽屉本体 */}
          <div 
            className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto"
          >
            {/* 抽屉头部：自带关闭按钮 */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-5 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm">
               <span className="font-bold text-lg text-gray-800">菜单导航</span>
               <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
               >
                  <X size={28} />
               </button>
            </div>

            {/* 抽屉内容 */}
            <div className="p-5 space-y-6 pb-24">
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">页面导航</h3>
                <div className="grid grid-cols-2 gap-3">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center px-3 py-3 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-blue-50 hover:text-blue-600 border border-gray-100 active:scale-95 transition-all"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </section>

              <hr className="border-gray-100" />

              <section>
                 {isLoggedIn ? (
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-800 truncate">{username}</p>
                          <Link href="/members" onClick={() => setIsOpen(false)} className="text-xs text-blue-600 hover:underline">个人中心</Link>
                        </div>
                      </div>
                      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-600 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <LogOut size={14} /> 注销登录
                      </button>
                   </div>
                 ) : (
                    <Link href="/loginpage" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg active:scale-95 transition-transform">
                      <LogIn size={18} /> 立即登录
                    </Link>
                 )}
              </section>

              <hr className="border-gray-100" />

              <section className="space-y-4">
                 <div className="flex items-center gap-2 text-gray-800 mb-2">
                    <Clock size={18} className="text-blue-500" />
                    <h3 className="font-bold">班级动态</h3>
                 </div>
                 <div className="transform origin-top-left w-full"><WelcomeCard /></div>
                 <div className="space-y-3">
                    {timers.length > 0 ? (
                      timers.map((timer) => (
                        <div key={timer.id} className="w-full"><EventTimer title={timer.title} targetTime={timer.targetTime} isSpecial={timer.isSpecial} /></div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-gray-100">暂无倒计时</p>
                    )}
                 </div>
              </section>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}