import React from 'react';
import { notFound } from 'next/navigation';
import RichTextRenderer from '@/components/RichTextRenderer';

// 1. 定义接口：对应 Strapi v5 的标准返回结构
// 注意：为了稳妥，这里定义为小写开头，因为 API 通常返回小写
interface TeacherData {
  documentId: string;
  name: string;
  title: string;
  photo: string | null;
  subject: string;
  phone: string; // 建议前端统一处理为 string
  teachFrom: string | null;
  teachTo: string | null;
  introduction: string; // CKEditor 内容
}

// 2. 数据获取函数 (Strapi v5 专用)
async function getTeacher(documentId: string): Promise<TeacherData | null> {
  // 防止 Node.js 解析 localhost 报错，强制使用 IPv4
  const baseUrl = process.env.STRAPI_API_URL || "http://127.0.0.1:1337";
  
  try {
    // Strapi v5 获取单条数据的标准 API: /api/teachers/:documentId
    const url = `${baseUrl}/api/teachers/${documentId}`;
    
    const res = await fetch(url, { 
      cache: 'no-store', // 开发时不缓存
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`API Error: ${res.status}`);
    }

    const json = await res.json();
    const raw = json.data; // Strapi v5 直接在 data 下，没有 attributes

    if (!raw) return null;

    // === 关键重构：字段映射与大小写兼容 ===
    // 很多时候后台建的是 "Name"，但 API 返回的是 "name"
    // 这里做了双重检查 (raw.Name || raw.name)
    const teacher: TeacherData = {
      documentId: raw.documentId,
      name:         raw.Name || raw.name || "未命名教师",
      title:        raw.Title || raw.title || "",
      photo:        raw.Photo || raw.photo || null,
      subject:      raw.Subject || raw.subject || "",
      phone:        String(raw.Phone || raw.phone || ""),
      teachFrom:    raw.TeachFrom || raw.teachFrom || null,
      teachTo:      raw.TeachTo || raw.teachTo || null,
      introduction: raw.Introduction || raw.introduction || "",
    };

    return teacher;

  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// 辅助函数：格式化日期
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '至今';
  try {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  } catch (e) {
    return dateString;
  }
};

export default async function TeacherPage({ params }: { params: { documentId: string } }) {
  const teacher = await getTeacher(params.documentId);

  // 如果获取不到数据，显示 Next.js 标准 404 页面
  if (!teacher) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* === 左侧栏: 个人资料卡 === */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 sticky top-8">
            
            {/* 头像区域 */}
            <div className="relative h-72 w-full bg-gray-50">
              {teacher.photo ? (
                <img 
                  src={teacher.photo} 
                  alt={teacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100 flex-col gap-2">
                  <span className="text-4xl">📷</span>
                  <span className="text-sm">暂无照片</span>
                </div>
              )}
            </div>

            {/* 信息区域 */}
            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{teacher.name}</h1>
                {teacher.title && (
                  <p className="text-blue-600 font-medium mt-1">{teacher.title}</p>
                )}
              </div>

              {/* 学科标签 */}
              {teacher.subject && (
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {teacher.subject}
                </div>
              )}

              <div className="border-t border-gray-100 my-4"></div>

              {/* 联系方式 & 时间 */}
              <div className="space-y-3 text-sm">
                
                {/* 电话 */}
                {teacher.phone && (
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 shrink-0">联系电话</span>
                    <span className="text-gray-800 font-medium">{teacher.phone}</span>
                  </div>
                )}

                {/* 执教时间范围 */}
                {(teacher.teachFrom) && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">执教时间</span>
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                      <span>{formatDate(teacher.teachFrom)}</span>
                      <span className="text-gray-400">→</span>
                      <span>{formatDate(teacher.teachTo)}</span>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </aside>

        {/* === 右侧栏: 详细介绍 === */}
        <main className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100 min-h-[500px]">
             <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">教师简介</h2>
             
             {/* 富文本渲染组件 */}
             <RichTextRenderer content={teacher.introduction} />

             {(!teacher.introduction) && (
                  <div className="text-gray-400 italic mt-8 text-center p-10 bg-gray-50 rounded-lg">
                    暂无详细介绍...
                  </div>
             )}
          </div>
        </main>

      </div>
    </div>
  );
}