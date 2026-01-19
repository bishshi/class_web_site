import { notFound } from "next/navigation";
import { Calendar, Tag, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import ArticleRichText from "./ArticleRichText";
import ShareButton from "./ShareButton";
import type { BlocksContent } from "@strapi/blocks-react-renderer";

interface Article {
  documentId: string;
  title: string;
  summary: string;
  content: BlocksContent;
  category: "Teacher" | "Student" | "Event" | "SpecialEvent";
  cover: string;
  publishedAt: string;
}

async function getArticle(documentId: string): Promise<Article | null> {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  try {
    const res = await fetch(`${baseUrl}/api/articles/${documentId}?populate=*`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    return null;
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric", month: "long", day: "numeric",
  });
};

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  Teacher: { label: "师资力量", color: "text-purple-700", bg: "bg-purple-50" },
  Student: { label: "学生风采", color: "text-blue-700", bg: "bg-blue-50" },
  Event: { label: "班级活动", color: "text-amber-700", bg: "bg-amber-50" },
  SpecialEvent: { label: "特别策划", color: "text-rose-700", bg: "bg-rose-50" },
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return notFound();

  const categoryStyle = categoryConfig[article.category] || { label: "未分类", color: "text-gray-700", bg: "bg-gray-100" };

  return (
    <main className="min-h-screen bg-white pb-24 pt-24">
      
      {/* 顶部导航: 宽度与大容器对齐 */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 mb-8">
        <Link 
          href="/" 
          className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          返回首页
        </Link>
      </div>

      {/* 核心文章区域：扩大到 max-w-7xl */}
      <article className="container mx-auto max-w-7xl px-4 sm:px-6">

        {/* 1. 封面图: 撑满 7xl 宽度，视觉更震撼 */}
        {article.cover && (
          <div className="mb-12 overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={article.cover}
              alt={article.title}
              // max-h-[70vh] 让大图在宽屏下高度更舒展
              className="w-full h-auto object-cover max-h-[70vh]" 
            />
          </div>
        )}
        
        {/* 内容容器: 限制在 5xl (约1024px) 居中，防止文字行太长难以阅读 */}
        <div className="mx-auto max-w-5xl">
          
          {/* 文章头部 */}
          <header className="mb-10 border-b border-slate-100 pb-10">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.color}`}>
                <Tag className="mr-1.5 h-3 w-3" />
                {categoryStyle.label}
              </span>
              <span className="inline-flex items-center text-sm text-slate-500">
                <Calendar className="mr-1.5 h-3.5 w-3.5" />
                {formatDate(article.publishedAt)}
              </span>
            </div>

            <h1 className="mb-6 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-6xl">
              {article.title}
            </h1>

            {article.summary && (
              <p className="text-xl leading-relaxed text-slate-600 md:text-2xl">
                {article.summary}
              </p>
            )}
          </header>

          {/* 正文区域: 无框设计 */}
          <div className="max-w-none">
            <ArticleRichText content={article.content} />
            
            <div className="mt-16 flex items-center justify-between border-t border-slate-100 pt-8">
                <div className="text-sm text-slate-400 flex items-center">
                  <Clock className="mr-1.5 h-4 w-4" />
                  完
                </div>
                <ShareButton />
            </div>
          </div>

        </div>

      </article>
    </main>
  );
}