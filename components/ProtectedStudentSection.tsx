'use client';

import Link from 'next/link';
import { useStudents } from '@/hooks/useStudents'; // 引入刚才写的 Hook
import { Student } from '@/types/student';

// 复用卡片组件 (建议单独提取到一个文件 components/StudentCard.tsx)
const StudentCard = ({ student }: { student: Student }) => (
  <Link href={`/students/${student.documentId}`} className="group block">
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-3 relative">
      {student.Photo ? (
        <img src={student.Photo} alt={student.Name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">No Photo</div>
      )}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.Name}</h3>
      {student.location && (
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <span className="mr-1">📍</span> {student.location}
        </p>
      )}
    </div>
  </Link>
);

export default function ProtectedStudentSection() {
  // 一行代码搞定获取数据，自带缓存
  const { students, isLoading, isLoggedIn } = useStudents();

  // 渲染：未登录
  if (!isLoggedIn) {
    return (
       // ... (保持你之前的“权限受限” UI 代码不变) ...
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
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 opacity-50">
        {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>)}
      </div>
    );
  }

  // 渲染：已登录
  // 【直接截取前 8 个】，因为 hook 里已经排好序了
  const displayStudents = students.slice(0, 8);

  return (
    <>
      <div className="flex items-center justify-between mb-6 border-l-4 border-emerald-500 pl-4">
        <h3 className="text-xl font-bold text-gray-800">🎓 学生档案</h3>
        <Link href="/students" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">
          全部学生 &rarr;
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {displayStudents.map(student => (
          <StudentCard key={student.documentId} student={student} />
        ))}
      </div>
      {displayStudents.length === 0 && <p className="text-gray-400 text-sm">暂无学生档案</p>}
    </>
  );
}