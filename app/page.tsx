import HomeCarousel, { SlideItem } from '@/components/HomeCarousel';
import NoticeBar from '@/components/NoticeBar';
import CategorySection from '@/components/CategorySection';
import EventTimer from '@/components/EventTimer'; 

// --- 类型定义 ---
export type UIArticle = {
  id: number;
  documentId: string;
  title: string;
  summary: string;
  date: string;
};

export type TimerData = {
  id: number;
  title: string;
  targetTime: string;
  isSpecial: boolean;
};

type ArticleCategory = 'teacher' | 'student' | 'event' | 'special_event';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
const REVALIDATE_TIME = 60; 

// --- 数据获取函数 (保持您的逻辑不变) ---
async function getSlides(): Promise<SlideItem[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/slides?sort=order:asc`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.attributes?.title || item.title,
      imageUrl: item.attributes?.image || item.image || '/images/placeholder.jpg',
      link: item.attributes?.link || item.link || null,
    })) || [];
  } catch (error) { return []; }
}

async function getNotices(): Promise<string[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/notices?sort[0]=createdAt:desc&filters[isShow][$eq]=true`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => (item.attributes || item).content) || [];
  } catch (error) { return []; }
}

async function getArticlesByCategory(category: ArticleCategory): Promise<UIArticle[]> {
  try {
    const query = new URLSearchParams({
      'filters[category][$eq]': category,
      'sort[0]': 'publishedAt:desc',
      'pagination[pageSize]': '6'
    });
    const res = await fetch(`${STRAPI_URL}/api/articles?${query.toString()}`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.attributes?.title || item.title,
      summary: item.attributes?.summary || item.summary,
      date: new Date(item.attributes?.publishedAt || item.publishedAt).toLocaleDateString('zh-CN'),
    })) || [];
  } catch (error) { return []; }
}

async function getTimers(): Promise<TimerData[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/timers?filters[isActive][$eq]=true&sort[0]=order:asc`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      title: item.attributes?.title || item.Title || item.title || "Event",
      targetTime: item.attributes?.targetTime || item.targetTime,
      isSpecial: item.attributes?.isSpecial || item.isSpecial || false,
    })) || [];
  } catch (error) { return []; }
}

// --- 页面主组件 ---
export default async function HomePage() {
  const [slides, notices, specialEventData, eventData, teacherData, studentData, timers] = await Promise.all([
    getSlides(),
    getNotices(),
    getArticlesByCategory('SpecialEvent' as any),
    getArticlesByCategory('Event' as any),
    getArticlesByCategory('Teacher' as any),
    getArticlesByCategory('Student' as any),
    getTimers(),
  ]);

  const hasTimer = timers.length > 0;

  return (
    <main className="min-h-screen bg-white pb-20">
      <HomeCarousel slides={slides} />
      <NoticeBar notices={notices} />

      <div className={`container mx-auto px-4 mt-12 transition-all duration-300 ${hasTimer ? "max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8" : "max-w-6xl"}`}>
        
        {/* 左侧主要内容区域 */}
        <div className={`space-y-16 ${hasTimer ? "lg:col-span-9" : ""}`}>
          <section>
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-8 bg-red-600 rounded-full mr-3"></div>
              <h2 className="text-3xl font-bold text-gray-900">🔥 班级热点</h2>
            </div>
            <div className="space-y-12">
              <CategorySection title="特别策划" articles={specialEventData} color="bg-red-500" />
              <CategorySection title="班级活动" articles={eventData} color="bg-orange-500" />
            </div>
          </section>

        {/* --- 人物风采 --- */}
        <section className="bg-gray-50 p-6 md:p-10 rounded-3xl">
          {/* 顶部标题保持一致 */}
          <div className="flex items-center mb-12">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-3xl font-bold text-gray-900">👥 人物风采</h2>
          </div>

          {/* 将原有的 grid-cols-2 改为垂直堆叠 (space-y-20)
            这样每一行都能充分利用宽度，展示更多的文章简介
          */}
          <div className="space-y-20">
            {/* 1. 师资力量 */}
            <div className="relative">
              <CategorySection 
                title="师资力量" 
                articles={teacherData} 
                color="bg-blue-600" 
              />
              {/* 装饰性底线，增加板块间的呼吸感 */}
              <div className="absolute -bottom-10 left-0 w-full h-px bg-gray-200/60"></div>
            </div>

            {/* 2. 学生风采 */}
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
          <aside className="hidden lg:block lg:col-span-3">
            {/* 【关键修复】：
              1. sticky top-24 控制整个侧边栏整体粘停。
              2. space-y-6 确保多个计时器之间有间隔且不会重叠。
            */}
            <div className="sticky top-24 space-y-6">
               {timers.map((timer) => (
                 <EventTimer 
                   key={timer.id} 
                   title={timer.title} 
                   targetTime={timer.targetTime}
                   isSpecial={timer.isSpecial}
                 />
               ))}
               <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
                 关注班级动态，不错过精彩时刻
               </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}