import React from 'react';
import { notFound } from 'next/navigation';
import RichTextRenderer from '@/components/RichTextRenderer';

// === 类型定义 ===
interface TeacherData {
  documentId: string;
  name: string;
  title: string;
  photo: string | null;
  subject: string;
  phone: string;
  teachFrom: string | null;
  teachTo: string | null;
  introduction: string;
}

// === 工具函数：智能提取图片 URL ===
// 兼容：直接字符串 URL、Strapi v4/v5 对象结构、数组结构
const getPhotoUrl = (photoField: any): string | null => {
  if (!photoField) return null;

  // 1. 如果直接是 URL 字符串
  if (typeof photoField === 'string') {
    return photoField.trim();
  }

  // 2. 尝试从对象或数组中提取 url
  const url = 
    photoField.url ||                              // v5 简化格式
    photoField?.[0]?.url ||                        // 数组格式
    photoField?.data?.attributes?.url ||           // v4 标准格式
    photoField?.data?.url;                         // v5 嵌套格式

  return url || null;
};

// === 工具函数：日期格式化 ===
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '至今';
  try {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return dateString;
  }
};

// === 数据获取 ===
async function getTeacher(documentId: string): Promise<TeacherData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
  
  try {
    const res = await fetch(`${baseUrl}/api/teachers/${documentId}?populate=*`, { 
      cache: 'no-store', // 确保获取最新数据
    });

    if (!res.ok) return null;

    const json = await res.json();
    const raw = json.data;
    
    if (!raw) return null;

    // 字段映射 (兼容大小写)
    return {
      documentId: raw.documentId,
      name:       raw.Name || raw.name || "未命名教师",
      title:      raw.Title || raw.title || "",
      photo:      getPhotoUrl(raw.Photo || raw.photo),
      subject:    raw.Subject || raw.subject || "",
      phone:      String(raw.Phone || raw.phone || ""),
      teachFrom:  raw.TeachFrom || raw.teachFrom || null,
      teachTo:    raw.TeachTo || raw.teachTo || null,
      introduction: raw.Introduction || raw.introduction || "",
    };

  } catch (error) {
    // 生产环境通常会接入 Sentry 等监控，这里仅做静默失败处理
    return null;
  }
}

// === 页面组件 ===
type Props = {
  params: Promise<{ documentId: string }>;
};

export default async function TeacherPage({ params }: Props) {
  // Next.js 15: params 必须 await
  const { documentId } = await params;
  const teacher = await getTeacher(documentId);

  if (!teacher) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 左侧栏: 个人资料 */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
          {/* sticky top-24: 距离顶部 6rem (96px)，避免被导航栏遮挡 */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100 sticky top-24 transition-all duration-300">
            
            {/* 头像 */}
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

            {/* 信息列表 */}
            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{teacher.name}</h1>
                {teacher.title && (
                  <p className="text-blue-600 font-medium mt-1">{teacher.title}</p>
                )}
              </div>

              {teacher.subject && (
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {teacher.subject}
                </div>
              )}

              <div className="border-t border-gray-100 my-4" />

              <div className="space-y-3 text-sm">
                {teacher.phone && (
                  <div className="flex items-start">
                    <span className="text-gray-500 w-20 shrink-0">联系电话</span>
                    <span className="text-gray-800 font-medium">{teacher.phone}</span>
                  </div>
                )}

                {(teacher.teachFrom) && (
                  <div className="flex flex-col">
                    <span className="text-gray-500 mb-1">执教时间</span>
                    <div className="flex items-center gap-2 text-gray-800 font-medium">
                      <span>{formatDate(teacher.teachFrom)}</span>
                      <span className="text-gray-400">→</span>
                      <span>{teacher.teachTo ? formatDate(teacher.teachTo) : '至今'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* 右侧栏: 详细介绍 */}
        <main className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100 min-h-[500px]">
             <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">教师简介</h2>
             
             <RichTextRenderer content={teacher.introduction} />

             {!teacher.introduction && (
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