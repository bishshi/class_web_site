import { getSmartCache } from "@/lib/fetch-config";
import Link from "next/link";
import { notFound } from "next/navigation";

// -----------------------------------------------------------------------------
// 1. 配置区域
// -----------------------------------------------------------------------------
const CATEGORY_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  "Teacher": { label: "教师风采", color: "bg-purple-100 text-purple-800", desc: "名师荟萃，匠心育人" },
  "Student": { label: "学生风采", color: "bg-blue-100 text-blue-800", desc: "青春飞扬，无限可能" },
  "Event": { label: "班级活动", color: "bg-amber-100 text-amber-800", desc: "多彩生活，实践真知" },
  "SpecialEvent": { label: "特别策划", color: "bg-red-100 text-red-800", desc: "聚焦热点，深度报道" },
};

// -----------------------------------------------------------------------------
// 2. 类型定义
// -----------------------------------------------------------------------------
interface Article {
  documentId: string;
  title: string;
  summary: string;
  category: "Teacher" | "Student" | "Event" | "SpecialEvent"; 
  cover: string;
  publishedAt: string;
  isTop?: boolean;
}

// 新增 Meta 定义，用于接收分页信息
interface Meta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  }
}

// -----------------------------------------------------------------------------
// 3. 数据获取函数 (Server Side)
// -----------------------------------------------------------------------------
const PAGE_SIZE = 12; // 【新增】每页显示 12 篇

async function getArticlesByCategory(slug: string, page: number = 1) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  
  const query = new URLSearchParams({
    "filters[category][$eq]": slug,
    "sort[0]": "isTop:desc",
    "sort[1]": "publishedAt:desc",
    // 【新增】分页参数
    "pagination[page]": page.toString(),
    "pagination[pageSize]": PAGE_SIZE.toString(),
  });

  try {
    const res = await fetch(`${baseUrl}/api/articles?${query.toString()}`, {
      ...getSmartCache()
    });

    if (!res.ok) {
      console.error("Strapi API Error:", res.status, res.statusText);
      return { data: [], meta: null };
    }

    const json = await res.json();
    
    const articles = json.data?.map((item: any) => ({
      documentId: item.documentId,
      title: item.title,
      summary: item.summary,
      category: item.category,
      cover: item.cover,
      publishedAt: item.publishedAt,
      isTop: item.isTop || false,
    })) || [];

    // 注意：既然 API 已经用 isTop:desc 排序了，分页是准确的。
    // 这里的二次排序是防御性的，确保当前页内 Top 在前。
    const sortedArticles = articles.sort((a: Article, b: Article) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return 0;
    });

    // 【修改】返回 meta 数据
    return { data: sortedArticles, meta: json.meta as Meta };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { data: [], meta: null };
  }
}

// -----------------------------------------------------------------------------
// 4. 页面组件 (Next.js 15 Server Component)
// -----------------------------------------------------------------------------
export default async function CategoryPage({
  params,
  searchParams, // 接收查询参数
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>; // Next.js 15 中 searchParams 也是 Promise
}) {
  const { slug } = await params; 
  const { page } = await searchParams; // 解析页码
  
  const decodedSlug = decodeURIComponent(slug);
  // 转换页码，默认为 1
  const currentPage = Number(page) || 1;

  const categoryInfo = CATEGORY_CONFIG[decodedSlug];
  
  if (!categoryInfo) {
    notFound();
  }

  // 【修改】传入 currentPage
  const { data: articles, meta } = await getArticlesByCategory(decodedSlug, currentPage);
  const totalPages = meta?.pagination.pageCount || 1;

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="pt-20 pb-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            {categoryInfo.label}专栏
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl">
            {/* 显示总条数 */}
            {categoryInfo.desc} — 共 {meta?.pagination.total || 0} 篇
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {articles.map((article: Article) => (
                <article key={article.documentId} className="group cursor-pointer flex flex-col h-full">
                   {/* ...这里保持你的 Article 卡片代码不变... */}
                   {/* 为了节省篇幅，这里省略了卡片内部代码，直接复制你原来的即可 */}
                   <Link href={`/article/${article.documentId}`} className="block h-full">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 rounded-lg mb-6">
                      <img src={article.cover} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {article.isTop && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                           📌 置顶
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">{article.title}</h2>
                      <p className="text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">{article.summary}</p>
                      <div className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-auto">阅读全文 &rarr;</div>
                    </div>
                   </Link>
                </article>
              ))}
            </div>

            {/* 【新增】分页控制区域 */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-6 border-t border-slate-100 pt-10">
                {/* 上一页按钮 */}
                {currentPage > 1 ? (
                  <Link
                    href={`/category/${slug}?page=${currentPage - 1}`}
                    className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    ← 上一页
                  </Link>
                ) : (
                  <span className="px-6 py-2.5 rounded-full border border-slate-100 text-slate-300 cursor-not-allowed text-sm font-medium">
                    ← 上一页
                  </span>
                )}

                <span className="text-slate-500 font-medium text-sm">
                  第 <span className="text-slate-900">{currentPage}</span> / {totalPages} 页
                </span>

                {/* 下一页按钮 */}
                {currentPage < totalPages ? (
                  <Link
                    href={`/category/${slug}?page=${currentPage + 1}`}
                    className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-colors text-sm font-medium"
                  >
                    下一页 →
                  </Link>
                ) : (
                  <span className="px-6 py-2.5 rounded-full border border-slate-100 text-slate-300 cursor-not-allowed text-sm font-medium">
                    下一页 →
                  </span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-lg">该分类下暂无文章</p>
            <Link href="/" className="mt-4 inline-block text-slate-900 font-medium hover:underline">
              返回首页
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}