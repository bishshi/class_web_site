import HomeCarousel, { SlideItem } from '@/components/HomeCarousel';
import NoticeBar from '@/components/NoticeBar';
import CategorySection from '@/components/CategorySection';
import EventTimer from '@/components/EventTimer'; 
import WelcomeCard from '@/components/WelcomeCard';

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

// --- 数据获取函数 ---
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
      {/* 轮播图 */}
      <HomeCarousel slides={slides} />
      
      {/* 通知栏 */}
      <NoticeBar notices={notices} />

      {/* 主容器 */}
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12 ${
        hasTimer ? "max-w-7xl" : "max-w-6xl"
      }`}>
        <div className={`grid gap-6 lg:gap-8 ${hasTimer ? "lg:grid-cols-12" : "lg:grid-cols-1"}`}>
          
          {/* ============ 左侧主内容区 ============ */}
          <div className={`space-y-10 lg:space-y-12 ${hasTimer ? "lg:col-span-8 xl:col-span-9" : ""}`}>
            
            {/* 班级热点板块 */}
            <section className="animate-fade-in">
              {/* 简洁标题 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-7 bg-red-500 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  🔥 班级热点
                </h2>
              </div>

              {/* 内容区域 - 扁平化设计 */}
              <div className="space-y-6">
                {/* 特别策划 */}
                <div className="group">
                  <CategorySection 
                    title="特别策划" 
                    articles={specialEventData} 
                    color="bg-red-500" 
                  />
                </div>

                {/* 班级活动 */}
                <div className="group">
                  <CategorySection 
                    title="班级活动" 
                    articles={eventData} 
                    color="bg-orange-500" 
                  />
                </div>
              </div>
            </section>

            {/* 人物风采板块 */}
            <section className="animate-fade-in animation-delay-200">
              {/* 简洁标题 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-7 bg-blue-500 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  👥 人物风采
                </h2>
              </div>

              {/* 内容区域 - 扁平化设计 */}
              <div className="space-y-6">
                {/* 师资力量 */}
                <div className="group">
                  <CategorySection 
                    title="师资力量" 
                    articles={teacherData} 
                    color="bg-blue-500" 
                  />
                </div>

                {/* 学生风采 */}
                <div className="group">
                  <CategorySection 
                    title="学生风采" 
                    articles={studentData} 
                    color="bg-green-500" 
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ============ 右侧边栏 ============ */}
          {hasTimer && (
            <aside className={`${hasTimer ? "lg:col-span-4 xl:col-span-3" : "hidden"}`}>
              <div className="sticky top-20 lg:top-24 space-y-4">
                <div className="animate-fade-in">
                  <WelcomeCard />
                </div>
                {/* 计时器列表 */}
                {timers.map((timer, index) => (
                  <div 
                    key={timer.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <EventTimer 
                      title={timer.title} 
                      targetTime={timer.targetTime}
                      isSpecial={timer.isSpecial}
                    />
                  </div>
                ))}

                {/* 底部提示 */}
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📌</div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      关注班级动态<br />
                      不错过精彩时刻
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

    </main>
  );
}