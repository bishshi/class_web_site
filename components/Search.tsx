"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Fuse from "fuse.js";
import { getSearchIndex, SearchItem } from "@/lib/getSearchIndex";
import { useStudents } from "@/hooks/useStudents";

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
  
  const [publicData, setPublicData] = useState<SearchItem[]>([]);
  const [publicLoaded, setPublicLoaded] = useState(false);

  // 获取原始数据
  const { students: rawStudents, isLoading: studentsLoading } = useStudents();
  
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

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

  // 加载公共数据
  useEffect(() => {
    if (isOpen && !publicLoaded) {
      getSearchIndex().then((data) => {
        setPublicData(data);
        setPublicLoaded(true);
      });
    }
  }, [isOpen, publicLoaded]);

  const stableStudents = useMemo(() => {
    return rawStudents;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(rawStudents)]);

  // 合并数据源 (依赖改为 stableStudents)
  const allSourceData = useMemo(() => {
    const formattedStudents: SearchItem[] = stableStudents.map((stu: any) => ({
      id: `student-${stu.documentId || stu.id}`,
      title: stu.Name || stu.name,
      subTitle: "学生",
      href: `/students/${stu.documentId || stu.id}`,
      description: stu.location || "暂无班级信息",
      image: stu.Photo?.url || null
    }));
    return [...publicData, ...formattedStudents];
  }, [publicData, stableStudents]);

  // 配置 Fuse
  const fuse = useMemo(() => {
    return new Fuse(allSourceData, {
      keys: ["title", "description", "subTitle"],
      threshold: 0.3,
      includeScore: true,
    });
  }, [allSourceData]);

  // 🛠️ 修复点 2：安全的 Effect 更新
  useEffect(() => {
    if (!query.trim()) {
      // 这里的 trick 是：如果 current 已经是空数组，就返回 prev (引用相同)，
      // React 检测到 State 没变，就不会触发重渲染。
      setResults(prev => prev.length === 0 ? prev : []);
      return;
    }
    
    const fuseResults = fuse.search(query);
    setResults(fuseResults.map((res) => res.item).slice(0, 20));
  }, [query, fuse]);

  const isGlobalLoading = !publicLoaded || (isOpen && studentsLoading && rawStudents.length === 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100/50 backdrop-blur-sm border border-gray-200/50 rounded-full hover:bg-gray-200/80 transition-all"
      >
        <SearchIcon />
        <span className="hidden sm:inline">搜索...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-md shadow-sm">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-24 px-4 sm:px-6 font-sans">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
            
            <div className="flex items-center border-b border-gray-200/60 px-4 py-4">
              <div className="text-gray-400"><SearchIcon /></div>
              <input
                type="text"
                className="flex-1 ml-3 bg-transparent outline-none text-lg text-gray-900 placeholder-gray-400"
                placeholder="搜索文章、老师、同学..."
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <CloseIcon />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isGlobalLoading ? (
                 <div className="p-12 text-center text-gray-400 text-sm animate-pulse">正在同步数据...</div>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-gray-100 py-2">
                  {results.map((item) => (
                    <li key={item.id}>
                      <Link 
                        href={item.href} 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50/50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                          {item.image ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">暂无</div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-gray-800 font-medium group-hover:text-blue-600 transition-colors truncate pr-2">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-200 px-1.5 py-0.5 rounded bg-gray-50 flex-shrink-0">
                              {item.subTitle}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <div className="p-16 text-center text-gray-500">
                  <p>没有找到与 "{query}" 相关的内容</p>
                </div>
              ) : (
                <div className="p-16 text-center text-gray-400 text-sm">
                  输入关键词开始搜索
                </div>
              )}
            </div>

            <div className="bg-gray-50/80 px-4 py-2 text-xs text-gray-400 border-t border-gray-200/60 flex justify-between items-center backdrop-blur-sm">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${rawStudents.length > 0 ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}></span>
                {rawStudents.length > 0 ? 'Full Access Mode' : 'Public Search Mode'}
              </span>
              <div className="flex gap-3 font-mono opacity-70">
                 <span>Enter 确认</span>
                 <span>Esc 关闭</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}