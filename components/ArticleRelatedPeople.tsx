'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ============================================================================
// 类型定义
// ============================================================================
interface Person {
  documentId: string;
  name: string;
  photoUrl?: string;
  location?: string;
  title?: string;
}

interface RelatedPeopleProps {
  relatedPerson?: string;
}

// ============================================================================
// 人员卡片组件
// ============================================================================
const PersonCard = ({ 
  person, 
  type 
}: { 
  person: Person; 
  type: 'teacher' | 'student' 
}) => {
  const href = type === 'teacher' ? `/teachers/${person.documentId}` : `/students/${person.documentId}`;
  
  return (
    <Link href={href} className="group block">
      <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-3 relative">
        {person.photoUrl ? (
          <img 
            src={person.photoUrl} 
            alt={person.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            {type === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {person.name}
        </h3>
        {type === 'teacher' && person.title && (
          <p className="text-sm text-gray-500 mt-1">{person.title}</p>
        )}
        {type === 'student' && person.location && (
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="mr-1">📍</span> {person.location}
          </p>
        )}
      </div>
    </Link>
  );
};

// ============================================================================
// "全体"占位卡片（横向样式，与文章卡片对齐）
// ============================================================================
const AllPeopleCard = ({ type }: { type: 'teacher' | 'student' }) => {
  const href = type === 'teacher' ? '/teachers' : '/students';
  const label = type === 'teacher' ? '全体教师' : '全体学生';
  const icon = type === 'teacher' ? '👨‍🏫' : '👨‍🎓';
  const bgColor = type === 'teacher' ? 'from-blue-50 to-indigo-100' : 'from-emerald-50 to-green-100';
  const borderColor = type === 'teacher' ? 'border-blue-300' : 'border-emerald-300';
  const textColor = type === 'teacher' ? 'text-blue-600' : 'text-emerald-600';
  
  return (
    <Link href={href} className="group block">
      <div className={`w-full overflow-hidden rounded-xl bg-gradient-to-br ${bgColor} p-8 relative border-2 border-dashed ${borderColor} hover:shadow-md transition-all duration-300`}>
        <div className="flex items-center justify-center gap-4">
          <div className="text-5xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${textColor} mb-1`}>{label}</h3>
            <p className="text-gray-500 text-sm">点击查看全部 →</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// 主组件
// ============================================================================
export default function ArticleRelatedPeople({ relatedPerson }: RelatedPeopleProps) {
  const [teachers, setTeachers] = useState<Person[]>([]);
  const [students, setStudents] = useState<Person[]>([]);
  const [showAllTeachers, setShowAllTeachers] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasStudentRefs, setHasStudentRefs] = useState(false);

  useEffect(() => {
    // 检查是否登录
    const checkLogin = typeof window !== 'undefined' && !!localStorage.getItem('token');
    setIsLoggedIn(checkLogin);
    
    parseAndFetchPeople(checkLogin);
  }, [relatedPerson]);

  const parseAndFetchPeople = async (loggedIn: boolean) => {
    if (!relatedPerson || !relatedPerson.trim()) {
      setLoading(false);
      return;
    }

    try {
      const lines = relatedPerson.split('\n').map(line => line.trim()).filter(line => line);
      
      const teacherIds: string[] = [];
      const studentIds: string[] = [];
      let hasAllTeachers = false;
      let hasAllStudents = false;

      // 解析每一行
      lines.forEach(line => {
        if (line.startsWith('teacher:')) {
          const id = line.replace('teacher:', '').trim();
          if (id === 'ALL') {
            hasAllTeachers = true;
          } else if (id) {
            teacherIds.push(id);
          }
        } else if (line.startsWith('student:')) {
          const id = line.replace('student:', '').trim();
          if (id === 'ALL') {
            hasAllStudents = true;
          } else if (id) {
            studentIds.push(id);
          }
        }
      });

      setShowAllTeachers(hasAllTeachers);
      setShowAllStudents(hasAllStudents);
      setHasStudentRefs(hasAllStudents || studentIds.length > 0);

      // 教师数据：无论是否登录都可以获取（公开）
      if (teacherIds.length > 0) {
        const teacherData = await fetchTeachers(teacherIds);
        setTeachers(teacherData);
      }

      // 学生数据：只有登录后才获取
      if (loggedIn && studentIds.length > 0) {
        const studentData = await fetchStudents(studentIds);
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Failed to parse and fetch related people:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取教师数据（公开，无需权限）
  const fetchTeachers = async (documentIds: string[]): Promise<Person[]> => {
    if (documentIds.length === 0) return [];

    try {
      const filters = documentIds.map((id, index) => 
        `filters[$or][${index}][documentId][$eq]=${id}`
      ).join('&');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/teachers?${filters}&populate=*`
      );

      if (res.ok) {
        const json = await res.json();
        return json.data?.map((item: any) => ({
          documentId: item.documentId,
          name: item.Name || '未知教师',
          photoUrl: item.Photo || '',
          location: item.location,
          title: item.title,
        })) || [];
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    }
    return [];
  };

  // 获取学生数据（需要登录权限）
  const fetchStudents = async (documentIds: string[]): Promise<Person[]> => {
    if (documentIds.length === 0) return [];

    try {
      const token = localStorage.getItem('token');
      
      const filters = documentIds.map((id, index) => 
        `filters[$or][${index}][documentId][$eq]=${id}`
      ).join('&');

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?${filters}&populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.ok) {
        const json = await res.json();
        return json.data?.map((item: any) => ({
          documentId: item.documentId,
          name: item.Name || '未知学生',
          photoUrl: item.Photo || '',
          location: item.location,
        })) || [];
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
    return [];
  };

  // 检查是否有任何内容需要显示
  const hasAnyContent = showAllTeachers || teachers.length > 0 || hasStudentRefs;
  
  if (!loading && !hasAnyContent) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t-2 border-gray-100">
        <div className="text-center text-gray-400">加载相关人员...</div>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-8 border-t-2 border-gray-100">
      {/* 相关教师 - 始终显示（如果有引用） */}
      {(teachers.length > 0 || showAllTeachers) && (
        <div className="mb-10">
          <div className="flex items-center mb-6 border-l-4 border-blue-500 pl-4">
            <h3 className="text-xl font-bold text-gray-800">👨‍🏫 相关教师</h3>
          </div>
          
          {/* 全体教师卡片（独占一行） */}
          {showAllTeachers && (
            <div className="mb-6">
              <AllPeopleCard type="teacher" />
            </div>
          )}
          
          {/* 具体教师卡片（网格布局） */}
          {teachers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {teachers.map(teacher => (
                <PersonCard key={teacher.documentId} person={teacher} type="teacher" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 相关学生 - 未登录显示锁定，登录后显示卡片 */}
      {hasStudentRefs && (
        <div>
          <div className="flex items-center mb-6 border-l-4 border-emerald-500 pl-4">
            <h3 className="text-xl font-bold text-gray-800">🎓 相关学生</h3>
          </div>
          
          {!isLoggedIn ? (
            // 未登录：显示锁定遮罩
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
          ) : (
            // 已登录：显示学生卡片
            <>
              {/* 全体学生卡片（独占一行） */}
              {showAllStudents && (
                <div className="mb-6">
                  <AllPeopleCard type="student" />
                </div>
              )}
              
              {/* 具体学生卡片（网格布局） */}
              {students.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {students.map(student => (
                    <PersonCard key={student.documentId} person={student} type="student" />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}