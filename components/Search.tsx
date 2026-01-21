"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Fuse from "fuse.js";
import { getSearchIndex, SearchItem } from "@/lib/getSearchIndex"; // 导入刚才改好的 Action

// 图标组件保持不变...
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
  const [results, setResults] = useState<SearchItem[]>([]);
  const [sourceData, setSourceData] = useState<SearchItem[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const pathname = usePathname();

  // 路由变化关闭弹窗
  useEffect(() => setIsOpen(false), [pathname]);

  // 快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 打开时加载数据
  useEffect(() => {
    if (isOpen && !dataLoaded) {
      getSearchIndex().then((data) => {
        console.log("搜索索引已加载:", data); // 调试用
        setSourceData(data);
        setDataLoaded(true);
      });
    }
  }, [isOpen, dataLoaded]);

  // 配置 Fuse
  const fuse = useMemo(() => {
    return new Fuse(sourceData, {
      keys: ["title", "description", "subTitle"], // 增加搜索 subTitle，这样搜"语文"也能搜到老师
      threshold: 0.3,
      includeScore: true,
    });
  }, [sourceData]);

  // 执行搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const fuseResults = fuse.search(query);
    setResults(fuseResults.map((res) => res.item).slice(0, 20));
  }, [query, fuse]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
      >
        <SearchIcon />
        <span className="hidden sm:inline">搜索全站...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-md shadow-sm">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 sm:px-6 font-sans">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-gray-900/5">
            <div className="flex items-center border-b border-gray-100 px-4 py-3">
              <div className="text-gray-400"><SearchIcon /></div>
              <input
                type="text"
                className="flex-1 ml-3 bg-transparent outline-none text-lg text-gray-900 placeholder-gray-400"
                placeholder="搜索文章、老师、同学..."
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <CloseIcon />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {!dataLoaded ? (
                 <div className="p-8 text-center text-gray-400 text-sm animate-pulse">正在同步数据...</div>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-gray-50 py-2">
                  {results.map((item) => (
                    <li key={item.id}>
                      <Link 
                        href={item.href} 
                        className="block px-4 py-3 hover:bg-blue-50/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          {/* 如果有图显示缩略图 */}
                          {item.image && (
                            <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                               {/* 这里为了演示简单用了img，建议换成 next/image */}
                               {/* eslint-disable-next-line @next/next/no-img-element */}
                               <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">
                                {item.title}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50">
                                {item.subTitle}
                              </span>
                            </div>
                            {item.description && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <div className="p-12 text-center text-gray-500">无相关结果</div>
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">输入关键词开始搜索</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}