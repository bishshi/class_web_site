import Link from 'next/link';
import { Student } from '@/types/student'; // 假设您定义了类型

async function getStudents() {
  // Strapi v5: 使用 documentId，返回扁平化 data 数组
  // 我们只取列表页需要的字段以优化性能
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?fields[0]=Name&fields[1]=Photo&fields[2]=location&fields[3]=documentId`,
    { cache: 'no-store' }
  );
  const json = await res.json();
  return json.data as Student[];
}

export default async function StudentListPage() {
  const students = await getStudents();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
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
            {/* 照片区域：无边框，纯粹的圆角矩形 */}
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-4 relative">
              {student.Photo ? (
                <img 
                  src={student.Photo} 
                  alt={student.Name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  No Photo
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
    </div>
  );
}