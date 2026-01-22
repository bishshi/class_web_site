'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { Student } from '@/types/student';
import { isAuthenticated } from '@/lib/auth';

export default function StudentProfilePage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetchStudentDetails();
    } else {
      setLoading(false);
    }
  }, [documentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students/${documentId}?populate=*`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.ok) {
        const json = await res.json();
        setStudent(json.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
             <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-6"></div>
             <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          </div>
          <div className="lg:col-span-8">
             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
             <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-10 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">访问受限</h2>
          <p className="text-gray-500 mb-8">请登录以验证身份查看档案。</p>
          <Link 
            href={`/login?redirect=/students/${documentId}`} 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
          >
            立即登录
          </Link>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到该学生信息</h2>
        <Link href="/students" className="text-blue-600 hover:underline">&larr; 返回列表</Link>
      </div>
    );
  }

  return (
    <article className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      {/* 面包屑导航 */}
      <div className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">首页</Link> 
        <span className="mx-2">/</span>
        <Link href="/students" className="hover:text-blue-600">学子风采</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{student.Name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-6 shadow-sm">
              {/* 【修改处】直接使用 student.Photo 字符串 */}
              {student.Photo ? (
                <img 
                  src={student.Photo} 
                  alt={student.Name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="text-5xl mb-2">🎓</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.Name}</h1>
            <div className="flex items-center text-gray-500 mb-6 space-x-4">
               {student.Sex && (
                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.Sex === '男' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                   {student.Sex}
                 </span>
               )}
               {student.location && <span>📍 {student.location}</span>}
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6 text-sm bg-white rounded-lg">
              {student.Birthday && (
                <div>
                  <span className="block text-gray-400 mb-1 text-xs uppercase tracking-wide">Birthday</span>
                  <span className="font-medium text-gray-900">{student.Birthday}</span>
                </div>
              )}
              {student.Email && (
                <div>
                  <span className="block text-gray-400 mb-1 text-xs uppercase tracking-wide">Email</span>
                  <a href={`mailto:${student.Email}`} className="font-medium text-blue-600 hover:underline">
                    {student.Email}
                  </a>
                </div>
              )}
              {student.Phone && (
                <div>
                  <span className="block text-gray-400 mb-1 text-xs uppercase tracking-wide">Phone</span>
                  <span className="font-medium text-gray-900">{student.Phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">个人简介</h2>
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
              {student.Introduction ? (
                <BlocksRenderer content={student.Introduction} />
              ) : (
                <p className="text-gray-400 italic">该同学暂无详细介绍。</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}