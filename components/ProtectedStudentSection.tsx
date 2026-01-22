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
       <div className="text-center p-8 border-2 border-dashed bg-gray-50 rounded-xl">请先登录查看</div>
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