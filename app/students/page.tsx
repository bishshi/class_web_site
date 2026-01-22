'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth'; 
import { Student } from '@/types/student';

export default function StudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // 【新增】分页状态
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 12; // 每页显示 12 个

  useEffect(() => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      // 当登录状态确认且页码变化时，获取数据
      fetchStudents(page);
    } else {
      setLoading(false);
    }
  }, [page]); // 依赖项加入 page，当页码改变自动触发请求

  const fetchStudents = async (currentPage: number) => {
    setLoading(true); // 翻页时也显示加载状态
    try {
      const token = localStorage.getItem('token');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?fields[0]=Name&fields[1]=Photo&fields[2]=location&fields[3]=documentId&pagination[page]=${currentPage}&pagination[pageSize]=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.ok) {
        const json = await res.json();
        setStudents(json.data || []);

        if (json.meta && json.meta.pagination) {
          setPageCount(json.meta.pagination.pageCount);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading && page === 1) { // 仅在首次加载或硬刷新时显示全屏骨架屏
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <header className="mb-12"><div className="h-10 bg-gray-200 rounded w-48 mb-4"></div></header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">学生档案</h1>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">权限受限</h2>
          <p className="text-gray-500 mb-8">为了保护学生隐私，请登录后查看。</p>
          <Link href={`/login?redirect=/students`} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 shadow-lg">立即登录</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">学子风采</h1>
          <p className="text-gray-500">认识我们要改变世界的未来之星</p>
        </div>
        <div className="text-sm text-gray-400">
          第 {page} 页 / 共 {pageCount} 页
        </div>
      </header>

      {loading ? (
        // 翻页时的轻量级 Loading (保留头部，只刷列表区域)
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 opacity-50">
           {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {students.map((student) => (
            <Link href={`/students/${student.documentId}`} key={student.documentId} className="group block">
              <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-4 relative shadow-sm hover:shadow-md transition-shadow">
                {student.Photo ? (
                  <img 
                    src={student.Photo} 
                    alt={student.Name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <span className="text-4xl mb-2">🎓</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.Name}</h3>
                {student.location && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center"><span className="mr-1">📍</span> {student.location}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 分页控制器 */}
      {pageCount > 1 && (
        <div className="mt-16 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
              page === 1 || loading
                ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600'
            }`}
          >
            上一页
          </button>
          
          <span className="text-gray-600 font-medium px-2">
            {page} <span className="text-gray-300 mx-1">/</span> {pageCount}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === pageCount || loading}
            className={`px-6 py-2 rounded-lg border text-sm font-medium transition-colors ${
              page === pageCount || loading
                ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600'
            }`}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}