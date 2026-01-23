'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import RichTextRenderer from '@/components/RichTextRenderer';
import ReactionPicker from '@/components/ReactionPicker';
import ShareButton from '@/components/ShareButton';
import CommentSection from "@/components/CommentSection";

const TWIKOO_ENV_ID = process.env.NEXT_PUBLIC_TWIKOO_ENV_ID || "";

// ============================================================================
// 类型定义
// ============================================================================
interface TeacherData {
  id: number;
  documentId: string;
  name: string;
  title: string;
  photo: string | null;
  subject: string;
  phone: string;
  teachFrom: string | null;
  teachTo: string | null;
  introduction: string;
  relatedArticle?: string;
}

// 新增:文章类型
interface Article {
  id: number;
  documentId: string;
  title: string;
  summary: string;
  cover: string;
  publishedAt: string;
  category: string;
  isTop?: boolean;
}

// ============================================================================
// 工具函数:智能提取图片 URL
// ============================================================================
const getPhotoUrl = (photoField: any): string | null => {
  if (!photoField) return null;

  if (typeof photoField === 'string') {
    return photoField.trim();
  }

  const url = 
    photoField.url ||
    photoField?.[0]?.url ||
    photoField?.data?.attributes?.url ||
    photoField?.data?.url;

  return url || null;
};

// ============================================================================
// 工具函数:日期格式化
// ============================================================================
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

// 新增:文章日期格式化
const formatArticleDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// ============================================================================
// 新增:文章卡片组件
// ============================================================================
const ArticleCard = ({ article }: { article: Article }) => {
  // 分类配置
  const categoryConfig: Record<string, { name: string; color: string }> = {
    'Teacher': { name: '教师风采', color: 'bg-blue-500' },
    'Student': { name: '学子风采', color: 'bg-emerald-500' },
    'Event': { name: '班级活动', color: 'bg-purple-500' },
    'SpecialEvent': { name: '特别策划', color: 'bg-amber-500' },
  };

  const config = categoryConfig[article.category] || { name: article.category, color: 'bg-gray-500' };

  return (
    <Link 
      href={`/article/${article.documentId}`}
      key={article.id}
      className="group block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-6">
        {/* 标签区域 */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
            {config.name}
          </span>
          {article.isTop && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
              <svg 
                className="w-3 h-3" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
              </svg>
              TOP
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-1">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
          {article.summary}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatArticleDate(article.publishedAt)}</span>
          <span>阅读全文 &rarr;</span>
        </div>
      </div>
    </Link>
  );
};

// ============================================================================
// 主组件
// ============================================================================
export default function TeacherPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 新增:相关文章状态
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    fetchTeacherDetails();
  }, [documentId]);

  const fetchTeacherDetails = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
      const res = await fetch(`${baseUrl}/api/teachers/${documentId}?populate=*`);

      if (res.ok) {
        const json = await res.json();
        const raw = json.data;

        if (raw) {
          const teacherData: TeacherData = {
            documentId: raw.documentId,
            name: raw.Name || raw.name || "未命名教师",
            title: raw.Title || raw.title || "",
            photo: getPhotoUrl(raw.Photo || raw.photo),
            subject: raw.Subject || raw.subject || "",
            phone: String(raw.Phone || raw.phone || ""),
            teachFrom: raw.TeachFrom || raw.teachFrom || null,
            teachTo: raw.TeachTo || raw.teachTo || null,
            introduction: raw.Introduction || raw.introduction || "",
            relatedArticle: raw.relatedArticle || raw.RelatedArticle || "",
          };

          setTeacher(teacherData);

          // 如果有 relatedArticle,获取文章
          if (teacherData.relatedArticle) {
            fetchRelatedArticles(teacherData.relatedArticle);
          }
        } else {
          setError(true);
        }
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // 新增:获取相关文章
  const fetchRelatedArticles = async (relatedArticle: string) => {
    if (!relatedArticle || !relatedArticle.trim()) {
      return;
    }

    setArticlesLoading(true);
    try {
      const documentIds = relatedArticle
        .split('\n')
        .map(line => line.trim())
        .filter(line => line);

      if (documentIds.length === 0) {
        setArticlesLoading(false);
        return;
      }

      const filters = documentIds.map((id, index) => 
        `filters[$or][${index}][documentId][$eq]=${id}`
      ).join('&');

      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://127.0.0.1:1337";
      const res = await fetch(
        `${baseUrl}/api/articles?${filters}&populate=*&sort[0]=publishedAt:desc`
      );

      if (res.ok) {
        const json = await res.json();
        const data = json.data?.map((item: any) => ({
          id: item.id,
          documentId: item.documentId,
          title: item.title,
          summary: item.summary,
          cover: item.cover || '',
          publishedAt: item.publishedAt,
          category: item.category,
          isTop: item.isTop || false,
        })) || [];
        setArticles(data);
      }
    } catch (error) {
      console.error('Failed to fetch related articles:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-gray-200 h-72 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-6xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到该教师信息</h2>
        <Link href="/teachers" className="text-blue-600 hover:underline">&larr; 返回列表</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* 左侧栏: 个人资料 */}
        <aside className="w-full md:w-1/3 lg:w-1/4">
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

        {/* 右侧栏: 详细介绍 + 相关文章 */}
        <main className="w-full md:w-2/3 lg:w-3/4">
          <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100 min-h-[500px]">
             <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">教师简介</h2>
             
             <RichTextRenderer content={teacher.introduction} />

             {!teacher.introduction && (
                <div className="text-gray-400 italic mt-8 text-center p-10 bg-gray-50 rounded-lg">
                  暂无详细介绍...
                </div>
             )}

             {/* ============================================ */}
             {/* 新增: Reaction 和分享按钮 */}
             {/* ============================================ */}
             <div className="mt-16 flex items-center justify-between border-t border-slate-100 pt-8">
               {/* 左侧:完成标记 */}
               <div className="text-sm text-slate-400 flex items-center">
                 <Clock className="mr-1.5 h-4 w-4" />
                 完
               </div>
               
               {/* 右侧:Reactions 和分享按钮 */}
                <ReactionPicker 
                  collectionType="api::teacher.teacher" 
                  itemId={teacher.id} // 必须传数字ID，例如 15
                />
             </div>

            {/* 评论区 */}
            <CommentSection 
              envId={TWIKOO_ENV_ID} 
              path={`/teachers/${teacher.documentId}`} 
            />
          </div>

          {/* ============================================================================ */}
          {/* 相关文章区块 */}
          {/* ============================================================================ */}
          {articles.length > 0 && (
            <div className="mt-8">
              <div className="bg-white p-8 shadow-sm rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-bold text-gray-800">相关文章</h3>
                  </div>
                  <span className="text-sm text-gray-500">共 {articles.length} 篇</span>
                </div>

                {articlesLoading ? (
                  <div className="text-center text-gray-400 py-8">加载相关文章...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}