import React from 'react';
import { notFound } from 'next/navigation';
import RichTextRenderer from '@/components/RichTextRenderer';

// 1. 接口定义
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

// 2. 数据获取函数 (含详细调试日志)
async function getTeacher(documentId: string): Promise<TeacherData | null> {
  const baseUrl = process.env.STRAPI_API_URL || "http://127.0.0.1:1337";
  
  // 关键：添加 populate=* 确保获取图片和关联字段
  const url = `${baseUrl}/api/teachers/${documentId}?populate=*`;

  console.log(`\n🔴 [Debug Start] 正在请求 Strapi: ${url}`);

  try {
    const res = await fetch(url, { 
      cache: 'no-store', // 开发环境不缓存
    });

    console.log(`👉 HTTP 状态码: ${res.status}`);

    if (!res.ok) {
      if (res.status === 404) {
        console.error(`❌ [Debug Error] Strapi 返回 404 (Not Found)。\n可能的两个原因：\n1. ID 错误 (v5 必须用 documentId)\n2. 该条目在后台是 Draft (未发布) 状态`);
        return null;
      }
      const errText = await res.text();
      console.error(`❌ [Debug Error] API 错误详情:`, errText);
      throw new Error(`API Error: ${res.status}`);
    }

    const json = await res.json();
    // 打印数据结构，帮助检查字段名大小写
    console.log(`✅ [Debug Success] 收到数据 (部分预览):`, JSON.stringify(json, null, 2).slice(0, 500) + '...');

    const raw = json.data;
    if (!raw) return null;

    // 字段映射 (兼容大小写)
    const teacher: TeacherData = {
      documentId: raw.documentId,
      name:       raw.Name || raw.name || "未命名教师",
      title:      raw.Title || raw.title || "",
      // 图片处理：Strapi v5 通常返回完整的 url 或需要拼接，这里做了防空处理
      photo:      (raw.Photo || raw.photo)?.url ? `${baseUrl}${(raw.Photo || raw.photo).url}` : null,
      subject:    raw.Subject || raw.subject || "",
      phone:      String(raw.Phone || raw.phone || ""),
      teachFrom:  raw.TeachFrom || raw.teachFrom || null,
      teachTo:    raw.TeachTo || raw.teachTo || null,
      introduction: raw.Introduction || raw.introduction || "",
    };

    return teacher;

  } catch (error) {
    console.error("❌ [Debug Exception] Fetch error:", error);
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

// === 3. 页面组件 (Next.js 15 修正版) ===

// 定义 Props 类型：params 必须是 Promise
type Props = {
  params: Promise<{ documentId: string }>;
};

export default async function TeacherPage({ params }: Props) {
  // ⚠️ 关键修正：Next.js 15 中必须先 await params
  const { documentId } = await params;

  // 使用解析出来的 documentId 获取数据
  const teacher = await getTeacher(documentId);

  // 如果获取不到数据，显示 404
  if (!teacher) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 左侧栏: 个人资料卡 */}
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

              {teacher.subject && (
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                  {teacher.subject}
                </div>
              )}

              <div className="border-t border-gray-100 my-4"></div>

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
                      <span>{formatDate(teacher.teachTo)}</span>
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