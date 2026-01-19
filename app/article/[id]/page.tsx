import { notFound } from "next/navigation";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
// 👇 引入刚才新建的客户端组件
import ArticleRichText from "./ArticleRichText";
// 👇 这里的 BlocksContent 类型只用于定义接口，不影响运行时
import type { BlocksContent } from "@strapi/blocks-react-renderer"; 

interface Article {
  documentId: string;
  title: string;
  summary: string;
  content: BlocksContent;
  category: "teacher" | "student" | "event" | "special_event";
  image: string;
  publishedAt: string;
}

async function getArticle(documentId: string): Promise<Article | null> {
  const baseUrl = process.env.STRAPI_API_URL || "http://localhost:1337";
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

const categoryMap: Record<string, string> = {
  teacher: "师资力量", student: "学生风采", event: "班级活动", special_event: "特别策划",
};

// 页面组件
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) return notFound();

  return (
    <main className="min-h-screen bg-gray-50 pb-20 pt-24">
      <div className="container mx-auto max-w-4xl px-4">
        
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </div>

        <header className="mb-10 text-center">
          <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-blue-700">
              <Tag className="mr-1.5 h-3.5 w-3.5" />
              {categoryMap[article.category] || article.category}
            </span>
            <span className="flex items-center">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              {formatDate(article.publishedAt)}
            </span>
          </div>
          <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {article.title}
          </h1>
          {article.summary && (
            <p className="mx-auto max-w-2xl text-lg text-gray-600">{article.summary}</p>
          )}
        </header>

        {article.image && (
          <div className="mb-10 overflow-hidden rounded-xl shadow-lg">
            <img src={article.image} alt={article.title} className="h-auto w-full object-cover" />
          </div>
        )}

        <article className="prose prose-lg mx-auto max-w-none prose-headings:text-gray-800 prose-a:text-blue-600 prose-img:rounded-lg bg-white p-8 md:p-12 rounded-2xl shadow-sm">
          {/* 👇 使用拆分出去的组件，传递纯 JSON 数据 */}
          {article.content ? (
            <ArticleRichText content={article.content} />
          ) : (
            <p className="text-gray-400 italic text-center">暂无正文内容</p>
          )}
        </article>

      </div>
    </main>
  );
}