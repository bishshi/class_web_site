'use client';

import { useState, useEffect } from 'react'; // 还需要 useEffect 来处理分页数据的切片
import Link from 'next/link';
import { useStudents } from '@/hooks/useStudents'; // 引入同一个 Hook

export default function StudentListPage() {
  const { students: allStudents, isLoading, isLoggedIn } = useStudents();
  
  // 分页状态
  const [page, setPage] = useState(1);
  const pageSize = 12;
  
  // 计算分页显示的数据
  // 注意：不需要再 fetch 了，直接切片 allStudents
  const pageCount = Math.ceil(allStudents.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const displayStudents = allStudents.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 渲染：加载中
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48 mb-12"></div>
        <div className="grid grid-cols-4 gap-8">
           {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  // 渲染：未登录
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">学生档案</h1>
        </header>
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">学生档案仅限内部访问</h2>
          <p className="text-gray-500 mb-8">请登录后查看详细班级成员信息</p>
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
          第 {page} 页 / 共 {pageCount || 1} 页
        </div>
      </header>

      {/* 渲染 displayStudents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
        {displayStudents.map((student) => (
          <Link href={`/students/${student.documentId}`} key={student.documentId} className="group block">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-4 relative shadow-sm hover:shadow-md transition-shadow">
              {student.Photo ? (
                <img src={student.Photo} alt={student.Name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50"><span className="text-4xl mb-2">🎓</span></div>
              )}
            </div>
            <div>
               <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.Name}</h3>
               {student.location && <p className="text-sm text-gray-500 mt-1">📍 {student.location}</p>}
            </div>
          </Link>
        ))}
      </div>

      {/* 分页控制器 (逻辑不变) */}
      {pageCount > 1 && (
        <div className="mt-16 flex justify-center items-center gap-4">
           <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="px-6 py-2 rounded-lg border">上一页</button>
           <span>{page} / {pageCount}</span>
           <button onClick={() => handlePageChange(page + 1)} disabled={page === pageCount} className="px-6 py-2 rounded-lg border">下一页</button>
        </div>
      )}
    </div>
  );
}