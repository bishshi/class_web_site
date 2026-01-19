"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { globalSearch, debounce } from "@/lib/search";
import { SearchResultItem } from "@/types/search";

// 这里使用 Heroicons 或 Lucide 的图标
// 如果没有安装图标库，可以用简单的文字代替
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname(); // 监听路由变化

  // 路由变化时自动关闭搜索框
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // 键盘快捷键 (Command+K 或 Ctrl+K 打开)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 执行搜索 (防抖)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await globalSearch(q);
      setResults(data);
      setLoading(false);
    }, 300),
    []
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    handleSearch(val);
  };

  return (
    <>
      {/* 触发按钮 (放在 Navbar 里) */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-md shadow-sm">
          ⌘K
        </kbd>
      </button>

      {/* 模态框主体 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6">
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          {/* 搜索框容器 */}
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* 头部输入框 */}
            <div className="flex items-center border-b border-gray-100 px-4 py-3">
              <SearchIcon />
              <input
                type="text"
                className="flex-1 ml-3 bg-transparent outline-none text-lg text-gray-900 placeholder-gray-400"
                placeholder="Search articles, students, events..."
                autoFocus
                value={query}
                onChange={onInputChange}
              />
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <CloseIcon />
              </button>
            </div>

            {/* 结果区域 */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">Searching...</div>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-gray-50">
                  {results.map((item) => (
                    <li key={item.id + item.category}>
                      <Link 
                        href={item.href} 
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 font-medium">{item.title}</span>
                          <span className="text-xs text-gray-400 uppercase tracking-wider border border-gray-200 px-1.5 py-0.5 rounded">
                            {item.subTitle}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <div className="p-8 text-center text-gray-500">
                  No results found for "{query}".
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Type to search across the entire site.
                </div>
              )}
            </div>

            {/* 底部提示 */}
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-400 border-t border-gray-100 flex justify-between">
              <span>SNext Search System</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}