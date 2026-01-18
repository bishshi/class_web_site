// app/page.tsx
import Image from "next/image";
import { fetchFromStrapi, STRAPI_URL } from "@/lib/api";

export default async function Home() {
  // 1. 调用我们在 lib 写好的工具，记得加 populate=* 拿图片
  const students = await fetchFromStrapi("students?populate=*");

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题区 */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">三年二班全体成员</h1>
          <p className="text-gray-500">永远的 We Are Family</p>
        </header>

        {/* 核心：响应式网格布局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((student: any) => {
            // 安全获取图片地址，防止报错
            const imageUrl = student.attributes.AvatarUrl || "https://via.placeholder.com/400";

            return (
              <div key={student.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden group">
                {/* 图片区域 */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={student.attributes.Name}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                
                {/* 文字区域 */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-800">{student.attributes.Name}</h2>
                  <p className="text-sm text-indigo-600 font-medium mb-2">学号: {student.attributes.StudentID || "N/A"}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {student.attributes.Bio || "这个同学很懒，什么都没写..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}