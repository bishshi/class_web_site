'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isAuthenticated, getToken } from '@/lib/auth'; 
import { StudentProfile } from '@/app/page';

// 复用之前的 StudentCard 样式，或者拆分出来
const StudentCard = ({ student }: { student: StudentProfile }) => (
  <Link href={`/students/${student.documentId}`} className="group block">
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-3 relative">
      {student.photoUrl ? (
        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">No Photo</div>
      )}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</h3>
      {student.location && (
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <span className="mr-1">📍</span> {student.location}
        </p>
      )}
    </div>
  </Link>
);

export default function ProtectedStudentSection() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 1. 检查是否登录
    const checkLogin = isAuthenticated(); // 或者 !!localStorage.getItem('token')
    setIsLoggedIn(checkLogin);

    if (checkLogin) {
      fetchStudents();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      // 注意：这里需要携带 Authorization 头
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?pagination[pageSize]=8&sort[0]=createdAt:asc&populate=*`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.map((item: any) => ({
          id: item.id,
          documentId: item.documentId,
          name: item.Name,
          location: item.location,
          photoUrl: item.Photo || '', 
        })) || [];
        setStudents(data);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
    } finally {
      setLoading(false);
    }
  };

  // 渲染：未登录状态 -> 显示锁定遮罩
  if (!isLoggedIn) {
    return (
      <div className="relative bg-gray-50 rounded-xl p-8 border-2 border-dashed border-gray-200 text-center h-[300px] flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-700 mb-2">学生档案仅限内部访问</h3>
        <p className="text-gray-500 mb-6">请登录后查看详细班级成员信息</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          去登录
        </Link>
      </div>
    );
  }

  // 渲染：加载中
  if (loading) {
    return <div className="text-center py-10 text-gray-400">正在加载档案数据...</div>;
  }

  // 渲染：已登录且有数据
  return (
    <>
       <div className="flex items-center justify-between mb-6 border-l-4 border-emerald-500 pl-4">
        <h3 className="text-xl font-bold text-gray-800">🎓 学生档案</h3>
        <Link href="/students" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
          全部学生 &rarr;
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {students.map(student => (
          <StudentCard key={student.documentId} student={student} />
        ))}
      </div>
      {students.length === 0 && <p className="text-gray-400 text-sm">暂无学生档案</p>}
    </>
  );
}