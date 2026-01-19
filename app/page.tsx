import HomeCarousel, { SlideItem } from '@/components/HomeCarousel';
import NoticeBar from '@/components/NoticeBar';
import CategorySection from '@/components/CategorySection';
import EventTimer from '@/components/EventTimer'; 

// --- 1. 类型定义 ---

// UI 组件需要的文章结构
export type UIArticle = {
  id: number;
  documentId: string;
  title: string;
  summary: string;
  date: string;
};

// 计时器数据结构 (增加 id 用于列表渲染 key)
export type TimerData = {
  id: number;
  title: string;
  targetTime: string;
  isSpecial: boolean;
};

// 文章分类枚举
type ArticleCategory = 'teacher' | 'student' | 'event' | 'special_event';

// --- 2. 基础配置 ---
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
const REVALIDATE_TIME = 60; 

// --- 3. 数据获取函数 ---

async function getSlides(): Promise<SlideItem[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/slides?sort=order:asc`, 
      { next: { revalidate: REVALIDATE_TIME } }
    );
    const json = await res.json();
    if (!res.ok || !json.data) return [];

    return json.data.map((item: any) => {
      const attrs = item.attributes || item; 
      return {
        id: item.id,
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

async function getNotices(): Promise<string[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/notices?sort[0]=createdAt:desc&filters[isShow][$eq]=true`,
      { next: { revalidate: REVALIDATE_TIME } }
    );
    const json = await res.json();
    if (!res.ok || !json.data) return [];

    return json.data.map((item: any) => (item.attributes || item).content);
  } catch (error) {
    console.error("Fetch notices error:", error);
    return [];
  }
}

async function getArticlesByCategory(category: ArticleCategory): Promise<UIArticle[]> {
  try {
    const query = new URLSearchParams({
      'filters[category][$eq]': category,
      'sort[0]': 'publishedAt:desc',
      'fields[0]': 'title',
      'fields[1]': 'summary',
      'fields[2]': 'publishedAt',
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
        id: item.id,
        documentId: item.documentId,
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

/**
 * 获取活跃的计时器列表 (Timers)
 * 修改：支持返回多个，并按 order 排序
 */
async function getTimers(): Promise<TimerData[]> {
  try {
    // 1. 移除 limit=1，获取所有
    // 2. sort 改为 order:asc (数字越小越靠前)
    const res = await fetch(
      `${STRAPI_URL}/api/timers?filters[isActive][$eq]=true&sort[0]=order:asc`,
      { next: { revalidate: REVALIDATE_TIME } }
    );
    const json = await res.json();
    
    if (!json.data) return [];
    
    return json.data.map((item: any) => {
      const attrs = item.attributes || item;
      return {
        id: item.id, // 必须获取 id 作为 key
        title: attrs.title || attrs.Title || "Event",
        targetTime: attrs.targetTime,
        isSpecial: attrs.isSpecial || false,
      };
    });
  } catch (error) {
    console.error("Fetch timers error:", error);
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
    studentData,
    timers // 这里现在是数组
  ] = await Promise.all([
    getSlides(),
    getNotices(),
    getArticlesByCategory('SpecialEvent' as any),
    getArticlesByCategory('Event' as any),
    getArticlesByCategory('Teacher' as any),
    getArticlesByCategory('Student' as any),
    getTimers(), // 调用新函数
  ]);

  // 判断是否有任何活跃的计时器
  const hasTimer = timers.length > 0;

  return (
    <main className="min-h-screen bg-white pb-20">
      <HomeCarousel slides={slides} />
      <NoticeBar notices={notices} />

      <div 
        className={`container mx-auto px-4 mt-12 transition-all duration-300 ${
          hasTimer 
            ? "max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8" 
            : "max-w-6xl"
        }`}
      >
        
        {/* --- 左侧主要内容区域 --- */}
        <div className={`space-y-16 ${hasTimer ? "lg:col-span-9" : ""}`}>
          
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

        {/* --- 右侧边栏区域 --- */}
        {hasTimer && (
          // 增加 space-y-6 让多个计时器之间有间距
          <aside className="hidden lg:block lg:col-span-3 space-y-6">
             {timers.map((timer) => (
               <EventTimer 
                 key={timer.id} // 唯一的 key
                 title={timer.title} 
                 targetTime={timer.targetTime}
                 isSpecial={timer.isSpecial}
               />
             ))}
          </aside>
        )}

      </div>
    </main>
  );
}