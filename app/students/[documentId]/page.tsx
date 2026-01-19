import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { notFound } from 'next/navigation';
import { Student } from '@/types/student';

// 获取单条学生数据
async function getStudent(documentId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students/${documentId}`,
    { cache: 'no-store' }
  );
  
  if (!res.ok) return null;
  const json = await res.json();
  return json.data as Student;
}

// Next.js 15 Page Props 类型
interface PageProps {
  params: Promise<{ documentId: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
  // Next.js 15 必须 await params
  const { documentId } = await params;
  const student = await getStudent(documentId);

  if (!student) return notFound();

  return (
    <article className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 左侧：个人档案卡片 (占 4 列) */}
        <div className="lg:col-span-4">
          <div className="sticky top-12">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-6">
              {student.Photo && (
                <img 
                  src={student.Photo} 
                  alt={student.Name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.Name}</h1>
            <div className="flex items-center text-gray-500 mb-6 space-x-4">
               {/* 简单的性别与位置展示 */}
               <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                 {student.Sex}
               </span>
               {student.location && <span>📍 {student.location}</span>}
            </div>

            {/* 联系信息区块 */}
            <div className="space-y-4 border-t pt-6 text-sm">
              {student.Birthday && (
                <div>
                  <span className="block text-gray-400 mb-1">Birthday</span>
                  <span className="font-medium text-gray-900">{student.Birthday}</span>
                </div>
              )}
              {student.Email && (
                <div>
                  <span className="block text-gray-400 mb-1">Email</span>
                  <a href={`mailto:${student.Email}`} className="font-medium text-blue-600 hover:underline">
                    {student.Email}
                  </a>
                </div>
              )}
              {student.Phone && (
                <div>
                  <span className="block text-gray-400 mb-1">Phone</span>
                  <span className="font-medium text-gray-900">{student.Phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：详细介绍 (占 8 列) */}
        <div className="lg:col-span-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b">个人简介</h2>
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600">
             {/* 使用 Strapi 官方 Blocks 渲染器 */}
            {student.Introduction ? (
              <BlocksRenderer content={student.Introduction} />
            ) : (
              <p className="text-gray-400 italic">该同学暂无详细介绍。</p>
            )}
          </div>
        </div>

      </div>
    </article>
  );
}