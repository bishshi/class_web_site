import HomeCarousel, { SlideItem } from '@/components/HomeCarousel';
import NoticeBar from '@/components/NoticeBar';
import CategorySection from '@/components/CategorySection';

// --- 1. 类型定义 ---

// UI 组件需要的文章结构
export type UIArticle = {
  id: number;          // 仅用于 React 列表的 key
  documentId: string;  // Strapi v5 的核心标识符，用于跳转详情页 /article/[documentId]
  title: string;
  summary: string;
  date: string;
};

// 文章分类枚举
type ArticleCategory = 'teacher' | 'student' | 'event' | 'special_event';

// --- 2. 基础配置 ---
// 使用 127.0.0.1 避免 Node.js 环境下的 IPv4/IPv6 解析问题
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
const REVALIDATE_TIME = 60; 

// --- 3. 数据获取函数 ---

/**
 * 获取轮播图数据
 */
async function getSlides(): Promise<SlideItem[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/slides?sort=order:asc`, 
      { next: { revalidate: REVALIDATE_TIME } }
    );
    
    const json = await res.json();
    
    if (!res.ok || !json.data) {
      console.warn("Slides fetch warning: No data returned.");
      return [];
    }

    return json.data.map((item: any) => {
      // Strapi v5 扁平化兼容处理
      const attrs = item.attributes || item; 
      
      return {
        id: item.id,
        // 虽然轮播图通常不跳详情页，但存下来是个好习惯
        documentId: item.documentId, 
        title: attrs.title,
        imageUrl: attrs.image || '/images/placeholder.jpg',
        link: attrs.link || null,
      };
    });
  } catch (error) {
    console.error("Fetch slides error:", error);
    return [];
  }
}

/**
 * 获取滚动公告
 */
async function getNotices(): Promise<string[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/notices?sort[0]=createdAt:desc&filters[isShow][$eq]=true`,
      { next: { revalidate: REVALIDATE_TIME } }
    );
    const json = await res.json();

    if (!res.ok || !json.data) return [];

    return json.data.map((item: any) => {
      const attrs = item.attributes || item;
      return attrs.content;
    });
  } catch (error) {
    console.error("Fetch notices error:", error);
    return [];
  }
}

/**
 * 通用文章获取函数 (适配 documentId)
 */
async function getArticlesByCategory(category: ArticleCategory): Promise<UIArticle[]> {
  try {
    const query = new URLSearchParams({
      'filters[category][$eq]': category,
      'sort[0]': 'publishedAt:desc',
      'fields[0]': 'title',
      'fields[1]': 'summary',
      'fields[2]': 'publishedAt',
      // v5 默认会返回 documentId，不需要显式在 fields 里请求它，但请求了也无妨
      'pagination[pageSize]': '6'
    });

    const res = await fetch(`${STRAPI_URL}/api/articles?${query.toString()}`, {
      next: { revalidate: REVALIDATE_TIME }
    });

    const json = await res.json();

    if (!res.ok || !json.data) return [];

    return json.data.map((item: any) => {
      const attrs = item.attributes || item;
      return {
        id: item.id,            // 数据库 ID (用于 key)
        documentId: item.documentId, // 🌟 关键修改：获取 documentId
        title: attrs.title,
        summary: attrs.summary,
        date: new Date(attrs.publishedAt).toLocaleDateString('zh-CN'), 
      };
    });
  } catch (error) {
    console.error(`Error fetching ${category}:`, error);
    return [];
  }
}

// --- 4. 页面主组件 ---

export default async function HomePage() {
  const [
    slides, 
    notices, 
    specialEventData, 
    eventData, 
    teacherData, 
    studentData
  ] = await Promise.all([
    getSlides(),
    getNotices(),
    getArticlesByCategory('SpecialEvent'),
    getArticlesByCategory('Event'),
    getArticlesByCategory('Teacher'),
    getArticlesByCategory('Student'),
  ]);

  return (
    <main className="min-h-screen bg-white pb-20">
      <HomeCarousel slides={slides} />
      <NoticeBar notices={notices} />

      <div className="container mx-auto px-4 mt-12 max-w-6xl space-y-16">
        
        {/* 班级热点 */}
        <section>
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-8 bg-red-600 rounded-full mr-3"></div>
              <h2 className="text-3xl font-bold text-gray-900">🔥 班级热点</h2>
            </div>
            
            <div className="space-y-12">
                <CategorySection 
                  title="特别策划" 
                  articles={specialEventData} 
                  color="bg-red-500" 
                />
                <CategorySection 
                  title="班级活动" 
                  articles={eventData} 
                  color="bg-orange-500" 
                />
            </div>
        </section>

        {/* 人物风采 */}
        <section className="bg-gray-50 p-6 md:p-10 rounded-3xl">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-3xl font-bold text-gray-900">👥 人物风采</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <CategorySection 
                      title="师资力量" 
                      articles={teacherData} 
                      color="bg-blue-600" 
                    />
                </div>
                <div>
                    <CategorySection 
                      title="学生风采" 
                      articles={studentData} 
                      color="bg-green-600" 
                    />
                </div>
            </div>
        </section>

      </div>
    </main>
  );
}