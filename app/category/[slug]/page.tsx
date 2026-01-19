import Link from "next/link";
import { notFound } from "next/navigation";

// -----------------------------------------------------------------------------
// 1. 配置区域：分类映射字典 (已更新)
// Keys 必须与 Strapi 数据库中的枚举值完全一致（区分大小写、空格）
// -----------------------------------------------------------------------------
const CATEGORY_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  "Teacher": {
    label: "师资队伍",
    color: "bg-purple-100 text-purple-800",
    desc: "名师荟萃，匠心育人"
  },
  "Student": {
    label: "学生风采",
    color: "bg-blue-100 text-blue-800",
    desc: "青春飞扬，无限可能"
  },
  "Event": {
    label: "校园活动",
    color: "bg-amber-100 text-amber-800",
    desc: "多彩生活，实践真知"
  },
  "SpecialEvent": { // 注意：这里使用了引号以包含空格
    label: "特别企划",
    color: "bg-red-100 text-red-800",
    desc: "聚焦热点，深度报道"
  },
};

// -----------------------------------------------------------------------------
// 2. 类型定义 (已更新)
// -----------------------------------------------------------------------------
interface Article {
  documentId: string;
  title: string;
  summary: string;
  // 这里的类型也对应更新，确保 TS 智能提示正确
  category: "Teacher" | "Student" | "Event" | "Special Event"; 
  image: string;
  publishedAt: string;
}

interface StrapiResponse {
  data: Article[];
  meta: any;
}

// -----------------------------------------------------------------------------
// 3. 数据获取函数 (Server Side)
// -----------------------------------------------------------------------------
async function getArticlesByCategory(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  
  // Next.js 会自动解码 URL 中的空格 (%20 -> " ")，所以这里的 slug 是原样的 "Special Event"
  const query = new URLSearchParams({
    "filters[category][$eq]": slug, // 精确匹配 Strapi 枚举值
    "sort": "publishedAt:desc",
  });

  try {
    const res = await fetch(`${baseUrl}/api/articles?${query.toString()}`, {
      cache: "no-store", 
    });

    if (!res.ok) {
      console.error("Strapi API Error:", res.status, res.statusText);
      return { data: [] };
    }

    const json = await res.json();
    return json as StrapiResponse;
  } catch (error) {
    console.error("Fetch Error:", error);
    return { data: [] };
  }
}

// -----------------------------------------------------------------------------
// 4. 页面组件 (Next.js 15 Server Component)
// -----------------------------------------------------------------------------
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. 解包 params
  // 如果 URL 是 /category/Special%20Event，这里的 slug 会自动解码为 "Special Event"
  const { slug } = await params; 
  // 为防止 URL 编码导致的匹配问题，可以额外 decode 一次（虽然 Next.js 通常会自动处理）
  const decodedSlug = decodeURIComponent(slug);

  // 2. 校验分类
  const categoryInfo = CATEGORY_CONFIG[decodedSlug];
  
  if (!categoryInfo) {
    // 如果找不到对应的配置（比如用户输入了小写的 /category/teacher），则返回 404
    notFound();
  }

  // 3. 获取数据
  const { data: articles } = await getArticlesByCategory(decodedSlug);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 头部区域 */}
      <header className="pt-20 pb-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
            <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">
              Category: {decodedSlug}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            {categoryInfo.label}专栏
          </h1>
          <p className="text-xl text-slate-500 max-w-3xl">
            {categoryInfo.desc} — 共找到 {articles.length} 篇文章
          </p>
        </div>
      </header>

      {/* 文章列表区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {articles.map((article) => (
              <article key={article.documentId} className="group cursor-pointer flex flex-col h-full">
                <Link href={`/article/${article.documentId}`} className="block h-full">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 rounded-lg mb-6">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs font-medium mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <time className="text-slate-400">
                        {new Date(article.publishedAt).toLocaleDateString('zh-CN')}
                      </time>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                      {article.title}
                    </h2>
                    
                    <p className="text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-1">
                      {article.summary}
                    </p>

                    <div className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform mt-auto">
                      阅读全文 
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-slate-400 text-lg">该分类下暂无文章</p>
            <Link 
              href="/" 
              className="mt-4 inline-block text-slate-900 font-medium hover:underline"
            >
              返回首页
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}