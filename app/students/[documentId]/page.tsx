'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import { Student } from '@/types/student';
import { isAuthenticated } from '@/lib/auth';
import CommentSection from "@/components/CommentSection";
import ReactionPicker from '@/components/ReactionPicker';
import ShareButton from '@/components/ShareButton';

const TWIKOO_ENV_ID = process.env.NEXT_PUBLIC_TWIKOO_ENV_ID || "";

// ============================================================================
// 新增:Article 类型定义(统一风格)
// ============================================================================
interface Article {
  id: number;          // 用于 key
  documentId: string;  // Strapi v5 标识,用于跳转
  title: string;
  summary: string;
  cover: string;
  publishedAt: string;
  category: string;
  isTop?: boolean;     // 是否置顶
}

// ============================================================================
// 文章卡片组件(统一风格)
// ============================================================================
const ArticleCard = ({ article }: { article: Article }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // 分类配置
  const categoryConfig: Record<string, { name: string; color: string }> = {
    'Teacher': { name: '教师风采', color: 'bg-blue-500' },
    'Student': { name: '学生风采', color: 'bg-emerald-500' },
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
          {/* 置顶标签 */}
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
          <span>{formatDate(article.publishedAt)}</span>
          <span>阅读全文 &rarr;</span>
        </div>
      </div>
    </Link>
  );
};

export default function StudentProfilePage() {
  const params = useParams();
  const documentId = params.documentId as string;
  const router = useRouter();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(false);
  
  // ============================================================================
  // 相关文章状态
  // ============================================================================
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      fetchStudentDetails();
    } else {
      setLoading(false);
    }
  }, [documentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students/${documentId}?populate=*`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (res.ok) {
        const json = await res.json();
        setStudent(json.data);
        
        // ============================================================================
        // 新增:获取相关文章
        // ============================================================================
        if (json.data.relatedArticle) {
          fetchRelatedArticles(json.data.relatedArticle);
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

  // ============================================================================
  // 获取相关文章的函数
  // ============================================================================
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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?${filters}&populate=*&sort[0]=publishedAt:desc`
      );

      if (res.ok) {
        const json = await res.json();
        const data = json.data?.map((item: any) => ({
          id: item.id,                    // 数据库 ID
          documentId: item.documentId,    // Strapi v5 标识
          title: item.title,
          summary: item.summary,
          cover: item.cover || '',
          publishedAt: item.publishedAt,
          category: item.category,
          isTop: item.isTop || false,     // 是否置顶
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
      <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
             <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-6"></div>
             <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          </div>
          <div className="lg:col-span-8">
             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
             <div className="h-40 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">学生档案仅限内部访问</h2>
          <p className="text-gray-500 mb-8">请登录后查看详细班级成员信息</p>
          <Link href={`/login`} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 shadow-lg">立即登录</Link>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到该学生信息</h2>
        <Link href="/students" className="text-blue-600 hover:underline">&larr; 返回列表</Link>
      </div>
    );
  }

  return (
    <article className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      {/* 面包屑导航 */}
      <div className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">首页</Link> 
        <span className="mx-2">/</span>
        <Link href="/students" className="hover:text-blue-600">学子风采</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{student.Name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-6 shadow-sm">
              {student.Photo ? (
                <img 
                  src={student.Photo} 
                  alt={student.Name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="text-5xl mb-2">🎓</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.Name}</h1>
            <div className="flex items-center text-gray-500 mb-6 space-x-4">
               {student.Sex && (
                 <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.Sex === '男' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                   {student.Sex}
                 </span>
               )}
               {student.location && <span>📍 {student.location}</span>}
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-6 text-sm bg-white rounded-lg">
              {student.Birthday && (
                <div>
                  <span className="block text-gray-400 mb-1 text-xs uppercase tracking-wide">Birthday</span>
                  <span className="font-medium text-gray-900">{student.Birthday}</span>
                </div>
              )}
              {student.Email && (
                <div>
                  <span className="block text-gray-400 mb-1 text-xs uppercase tracking-wide">Email</span>
                  <a href={`mailto:${student.Email}`} className="font-medium text-blue-600 hover:underline">
                    {student.Email}
                  </a>
                </div>
              )}
              {student.Phone && (
                <div>
                  <span className="block text-gray-400 mb-1 text-xs uppercase tracking-wide">Phone</span>
                  <span className="font-medium text-gray-900">{student.Phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 min-h-[400px]">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">个人简介</h2>
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
              {student.Introduction ? (
                <BlocksRenderer content={student.Introduction} />
              ) : (
                <p className="text-gray-400 italic">该同学暂无详细介绍。</p>
              )}
            </div>

            {/* ============================================ */}
            {/* Reaction 和分享按钮 */}
            {/* ============================================ */}
            <div className="mt-16 flex items-center justify-between border-t border-slate-100 pt-8">
              {/* 左侧:完成标记 */}
              <div className="text-sm text-slate-400 flex items-center">
                <Clock className="mr-1.5 h-4 w-4" />
                完
              </div>
              
              {/* 右侧:Reactions 和分享按钮 */}
              <div className="flex items-center gap-3">
                <ReactionPicker articleId={`student-${student.documentId}`} />
                <ShareButton />
              </div>
            </div>
                {/* 评论区 */}
                <CommentSection 
                  envId={TWIKOO_ENV_ID} 
                  path={`/students/${student.documentId}`} 
                />
          </div>

          {/* ============================================================================ */}
          {/* 相关文章区块 */}
          {/* ============================================================================ */}
          {articles.length > 0 && (
            <div className="mt-12 pt-8 border-t-2 border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-800">相关文章</h3>
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
          )}
        </div>
      </div>
    </article>
  );
}