'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth'; 
import { Student } from '@/types/student';

export default function StudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. 检查权限
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 2. 携带 Token 请求 Strapi
      // 注意：如果是图片字段是媒体类型，建议加上 &populate=* 以防拿不到图片 URL
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?fields[0]=Name&fields[1]=Photo&fields[2]=location&fields[3]=documentId`,
        {
          headers: {
            'Authorization': `Bearer ${token}`, // 关键：添加认证头
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.ok) {
        const json = await res.json();
        setStudents(json.data || []);
      } else {
        console.error('Fetch failed:', res.status);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- 状态 1: 加载中 (骨架屏) ---
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-64"></div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- 状态 2: 未登录 (显示拦截页) ---
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">学子风采</h1>
          <p className="text-gray-500">认识我们要改变世界的未来之星</p>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">权限受限</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            为了保护学生隐私，完整的班级通讯录仅对内部成员开放。
            <br />请登录后查看。
          </p>
          <Link 
            href={`/login?redirect=/students`} 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  // --- 状态 3: 已登录 (显示列表) ---
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">学子风采</h1>
        <p className="text-gray-500">认识我们要改变世界的未来之星</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
        {students.map((student) => (
          <Link 
            href={`/students/${student.documentId}`} 
            key={student.documentId}
            className="group block"
          >
            {/* 照片区域 */}
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
                  <span className="text-sm">暂无照片</span>
                </div>
              )}
            </div>

            {/* 信息区域 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {student.Name}
              </h3>
              {student.location && (
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <span className="mr-1">📍</span> {student.location}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {students.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          暂无学生数据
        </div>
      )}
    </div>
  );
}