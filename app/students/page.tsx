'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth'; 
import { Student } from '@/types/student';

export default function StudentListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?fields[0]=Name&fields[1]=Photo&fields[2]=location&fields[3]=documentId`,
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
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <header className="mb-12"><div className="h-10 bg-gray-200 rounded w-48 mb-4"></div></header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">学子风采</h1>
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
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">学子风采</h1>
        <p className="text-gray-500">认识我们要改变世界的未来之星</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
        {students.map((student) => (
          <Link href={`/students/${student.documentId}`} key={student.documentId} className="group block">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-4 relative shadow-sm hover:shadow-md transition-shadow">
              {/* 【修改处】直接使用 student.Photo 字符串 */}
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
    </div>
  );
}