import React from 'react';
import Link from 'next/link';

// --- 1. 定义接口 ---
interface TeacherSummary {
  documentId: string;
  Name: string;
  Title: string;
  Photo: string;
  Subject: string;
}

// --- 2. 数据获取函数 (注意：不要在这里加 export default) ---
async function getTeachers(): Promise<TeacherSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
  
  try {
    const res = await fetch(`${baseUrl}/api/teachers`, { 
      cache: 'no-store', 
    });

    if (!res.ok) {
      // 容错处理：如果 API 失败，返回空数组，避免页面崩溃
      console.error('Failed to fetch teachers:', res.statusText);
      return [];
    }

    const json = await res.json();
    return json.data || []; 
  } catch (error) {
    console.error("Error fetching teacher list:", error);
    return [];
  }
}

// --- 3. 页面组件 (必须在这里加 export default) ---
// 确保这是文件中唯一的 export default
export default async function TeachersIndexPage() {
  const teachers = await getTeachers();

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">师资力量</h1>
        <p className="text-gray-500">
          在这里认识我们的教学团队。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {teachers.map((teacher) => (
          <Link 
            key={teacher.documentId} 
            href={`/teachers/${teacher.documentId}`}
            className="group block"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {teacher.Photo ? (
                  <img 
                    src={teacher.Photo} 
                    alt={teacher.Name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <span className="text-4xl">🎓</span>
                  </div>
                )}
                {teacher.Subject && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
                    {teacher.Subject}
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                   <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                     {teacher.Name}
                   </h3>
                   <p className="text-sm text-blue-600 font-medium mt-1">
                     {teacher.Title}
                   </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                  <span>查看详情</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {teachers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">暂无数据</p>
        </div>
      )}
    </div>
  );
}