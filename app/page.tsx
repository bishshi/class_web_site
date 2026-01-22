import Link from 'next/link';
import HomeCarousel, { SlideItem } from '@/components/HomeCarousel';
import NoticeBar from '@/components/NoticeBar';
import CategorySection from '@/components/CategorySection'; 
import EventTimer from '@/components/EventTimer'; 
import WelcomeCard from '@/components/WelcomeCard';
// 新增引入：受保护的学生档案组件
import ProtectedStudentSection from '@/components/ProtectedStudentSection'; 

// --- 类型定义 ---
export type UIArticle = {
  id: number;
  documentId: string;
  title: string;
  summary: string;
  date: string;
  isTop?: boolean;
};

export type TeacherProfile = {
  id: number;
  documentId: string;
  name: string;
  title: string;
  photoUrl: string;
  subject: string;
};

// StudentProfile 的类型定义可以保留在这里供其他地方引用，
// 或者如果在 ProtectedStudentSection 里面重新定义了，这里也可以删掉。
// 暂时保留以防万一。
export type StudentProfile = {
  id: number;
  documentId: string;
  name: string;
  location: string;
  photoUrl: string;
};

export type TimerData = {
  id: number;
  title: string;
  targetTime: string;
  isSpecial: boolean;
};

type ArticleCategory = 'Teacher' | 'Student' | 'Event' | 'SpecialEvent';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://127.0.0.1:1337';
const REVALIDATE_TIME = 3600; // 1 hour

// --- 数据获取函数 ---
async function getSlides(): Promise<SlideItem[]> {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/slides?filters[isShow][$eq]=true&sort=order:asc`, 
      { next: { revalidate: REVALIDATE_TIME } }
    );
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      imageUrl: item.image || '/images/placeholder.jpg',
      link: item.link || null,
    })) || [];
  } catch (error) { return []; }
}

async function getNotices(): Promise<string[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/notices?sort[0]=createdAt:desc&filters[isShow][$eq]=true`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => item.content) || [];
  } catch (error) { return []; }
}

async function getArticlesByCategory(category: ArticleCategory): Promise<UIArticle[]> {
  try {
    const query = new URLSearchParams({
      'filters[category][$eq]': category,
      'sort[0]': 'isTop:desc',      
      'sort[1]': 'publishedAt:desc',
      'pagination[pageSize]': '6'
    });
    const res = await fetch(`${STRAPI_URL}/api/articles?${query.toString()}`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    
    const articles = json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      summary: item.summary,
      date: new Date(item.publishedAt).toLocaleDateString('zh-CN'),
      isTop: item.isTop || false,
    })) || [];
    
    return articles.sort((a: UIArticle, b: UIArticle) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return 0;
    });
  } catch (error) { return []; }
}

async function getTimers(): Promise<TimerData[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/timers?filters[isActive][$eq]=true&sort[0]=order:asc`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      title: item.title || "Event",
      targetTime: item.targetTime,
      isSpecial: item.isSpecial || false,
    })) || [];
  } catch (error) { return []; }
}

async function getTeacherProfiles(): Promise<TeacherProfile[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/teachers?pagination[pageSize]=8&sort[0]=createdAt:asc`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.Name,
      title: item.Title,
      photoUrl: item.Photo || '',
      subject: item.Subject,
    })) || [];
  } catch (error) { return []; }
}

// [已删除] getStudentProfiles 函数，因为这部分数据现在由客户端组件获取

// --- 组件定义 ---

const SectionBigTitle = ({ title, icon, colorClass }: { title: string, icon: string, colorClass: string }) => (
  <div className="flex justify-center items-center mb-8 mt-4">
    <div className={`${colorClass} text-white px-10 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-3`}>
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
        {title}
      </h2>
    </div>
  </div>
);

const TeacherCard = ({ teacher }: { teacher: TeacherProfile }) => (
  <Link href={`/teachers/${teacher.documentId}`} className="group block h-full">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {teacher.photoUrl ? (
          <img src={teacher.photoUrl} alt={teacher.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 text-2xl">🎓</div>
        )}
        {teacher.subject && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
            {teacher.subject}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{teacher.name}</h3>
        <p className="text-sm text-blue-600 font-medium mt-1">{teacher.title}</p>
      </div>
    </div>
  </Link>
);

// [已删除] StudentCard 组件，已移动至 ProtectedStudentSection.tsx

// --- 页面主组件 ---
export default async function HomePage() {
  const [
    slides, 
    notices, 
    specialArticleData, 
    eventArticleData, 
    teacherArticleData, 
    studentArticleData, 
    teacherProfileData,
    // studentProfileData, // [已删除] 移除这里的接收
    timers
  ] = await Promise.all([
    getSlides(),
    getNotices(),
    getArticlesByCategory('SpecialEvent'),
    getArticlesByCategory('Event'),
    getArticlesByCategory('Teacher'), 
    getArticlesByCategory('Student'), 
    getTeacherProfiles(),            
    // getStudentProfiles(), // [已删除] 移除这里的调用
    getTimers(),
  ]);

  const hasTimer = timers.length > 0;

  return (
    <main className="min-h-screen bg-white pb-20">
      <HomeCarousel slides={slides} />
      <NoticeBar notices={notices} />

      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12 ${hasTimer ? "max-w-7xl" : "max-w-6xl"}`}>
        <div className={`grid gap-6 lg:gap-8 ${hasTimer ? "lg:grid-cols-12" : "lg:grid-cols-1"}`}>
          
          {/* ============ 左侧主内容区 ============ */}
          <div className={`space-y-16 ${hasTimer ? "lg:col-span-8 xl:col-span-9" : ""}`}>
            
            {/* 板块一：班级热点 */}
            <section className="animate-fade-in">
              <SectionBigTitle 
                title="班级热点" 
                icon="🔥" 
                colorClass="bg-gradient-to-r from-red-500 to-rose-600" 
              />
              <div className="space-y-10">
                <div className="group">
                  <CategorySection title="特别策划" articles={specialArticleData} color="bg-red-500" />
                </div>
                <div className="group">
                  <CategorySection title="班级活动" articles={eventArticleData} color="bg-orange-500" />
                </div>
              </div>
            </section>

            {/* 板块二：风采展示 */}
            <section className="animate-fade-in animation-delay-200">
              <SectionBigTitle 
                title="风采展示" 
                icon="🌟" 
                colorClass="bg-gradient-to-r from-blue-500 to-indigo-600" 
              />
              <div className="space-y-10">
                <div className="group">
                  <CategorySection title="学生风采" articles={studentArticleData} color="bg-green-500" />
                </div>
                <div className="group">
                  <CategorySection title="教师风采" articles={teacherArticleData} color="bg-blue-500" />
                </div>
              </div>
            </section>

            {/* 板块三：档案库 */}
            <section className="animate-fade-in animation-delay-300">
              <SectionBigTitle 
                title="档案库" 
                icon="📂" 
                colorClass="bg-gradient-to-r from-emerald-500 to-teal-600" 
              />

              <div className="space-y-12">
                
                {/* 子项1：学生档案 (Protected) */}
                {/* 这里替换了原有的 Grid 和 Link 代码，改用新组件 */}
                <div>
                   <ProtectedStudentSection />
                </div>

                {/* 子项2：教师档案 (Grid) - 保持不变 */}
                <div>
                  <div className="flex items-center justify-between mb-6 border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-bold text-gray-800">👨‍🏫 教师档案</h3>
                    <Link href="/teachers" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      全部教师 &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {teacherProfileData.map(teacher => (
                      <TeacherCard key={teacher.documentId} teacher={teacher} />
                    ))}
                  </div>
                  {teacherProfileData.length === 0 && <p className="text-gray-400 text-sm">暂无教师档案</p>}
                </div>

              </div>
            </section>

          </div>

          {/* ============ 右侧边栏 ============ */}
          {hasTimer && (
            <aside className={`${hasTimer ? "hidden lg:block lg:col-span-4 xl:col-span-3" : "hidden"}`}>
              <div className="sticky top-20 lg:top-20 space-y-4">
                <div className="animate-fade-in"><WelcomeCard /></div>
                {timers.map((timer, index) => (
                  <div key={timer.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <EventTimer title={timer.title} targetTime={timer.targetTime} isSpecial={timer.isSpecial} />
                  </div>
                ))}
                <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📌</div>
                      <p className="text-sm text-slate-600 leading-relaxed">关注班级动态<br />不错过精彩时刻</p>
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