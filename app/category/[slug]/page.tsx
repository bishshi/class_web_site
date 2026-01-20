import Link from "next/link";
import { notFound } from "next/navigation";

// -----------------------------------------------------------------------------
// 1. 配置区域：分类映射字典 (已更新)
// Keys 必须与 Strapi 数据库中的枚举值完全一致（区分大小写、空格）
// -----------------------------------------------------------------------------
const CATEGORY_CONFIG: Record<string, { label: string; color: string; desc: string }> = {
  "Teacher": {
    label: "师资力量",
    color: "bg-purple-100 text-purple-800",
    desc: "名师荟萃，匠心育人"
  },
  "Student": {
    label: "学生风采",
    color: "bg-blue-100 text-blue-800",
    desc: "青春飞扬，无限可能"
  },
  "Event": {
    label: "班级活动",
    color: "bg-amber-100 text-amber-800",
    desc: "多彩生活，实践真知"
  },
  "SpecialEvent": {
    label: "特别策划",
    color: "bg-red-100 text-red-800",
    desc: "聚焦热点，深度报道"
  },
};

// -----------------------------------------------------------------------------
// 2. 类型定义 (已更新 - 添加 isTop 字段)
// -----------------------------------------------------------------------------
interface Article {
  documentId: string;
  title: string;
  summary: string;
  category: "Teacher" | "Student" | "Event" | "SpecialEvent"; 
  cover: string;
  publishedAt: string;
  isTop?: boolean; // 新增：是否置顶
}

interface StrapiResponse {
  data: Article[];
  meta: any;
}

// -----------------------------------------------------------------------------
// 3. 数据获取函数 (Server Side) - 添加置顶排序
// -----------------------------------------------------------------------------
async function getArticlesByCategory(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
  
  // 添加置顶排序：先按 isTop 降序，再按发布时间降序
  const query = new URLSearchParams({
    "filters[category][$eq]": slug,
    "sort[0]": "isTop:desc",        // 置顶文章优先
    "sort[1]": "publishedAt:desc",  // 时间倒序
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
    
    // 扁平化数据结构处理 - 确保数据格式正确
    const articles = json.data?.map((item: any) => ({
      documentId: item.documentId,
      title: item.title,
      summary: item.summary,
      category: item.category,
      cover: item.cover,
      publishedAt: item.publishedAt,
      isTop: item.isTop || false, // 提取 isTop 字段
    })) || [];

    // 客户端再次排序，确保置顶文章在前
    const sortedArticles = articles.sort((a: Article, b: Article) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return 0;
    });

    return { data: sortedArticles };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { data: [] };
  }
}

// -----------------------------------------------------------------------------
// 4. 页面组件 (Next.js 15 Server Component) - 添加 TOP 标签显示
// -----------------------------------------------------------------------------
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. 解包 params
  const { slug } = await params; 
  const decodedSlug = decodeURIComponent(slug);

  // 2. 校验分类
  const categoryInfo = CATEGORY_CONFIG[decodedSlug];
  
  if (!categoryInfo) {
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
                      src={article.cover}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    
                    {/* 置顶标签 - 显示在图片右上角 */}
                    {article.isTop && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg">
                          <svg 
                            className="w-3.5 h-3.5" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                          </svg>
                          置顶
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs font-medium mb-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wide ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      {/* 在标签旁也显示置顶标识（可选） */}
                      {article.isTop && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white">
                          📌 TOP
                        </span>
                      )}
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