import Link from 'next/link';
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

// 教师数据类型
export type TeacherData = {
  id: number;
  documentId: string;
  name: string;
  title: string;     // 职称
  photoUrl: string;
  subject: string;   // 科目
};

// 学生数据类型
export type StudentData = {
  id: number;
  documentId: string;
  name: string;
  location: string;  // 对应 location 字段
  photoUrl: string;
};

export type TimerData = {
  id: number;
  title: string;
  targetTime: string;
  isSpecial: boolean;
};

type ArticleCategory = 'Event' | 'SpecialEvent';

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

// 获取教师 (限制显示4个)
async function getTeachers(): Promise<TeacherData[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/teachers?pagination[pageSize]=4&sort[0]=createdAt:asc`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.Name || item.attributes?.Name,
      title: item.Title || item.attributes?.Title,
      photoUrl: item.Photo || item.attributes?.Photo || '',
      subject: item.Subject || item.attributes?.Subject,
    })) || [];
  } catch (error) { return []; }
}

// 获取学生 (限制显示4个)
async function getStudents(): Promise<StudentData[]> {
  try {
    // 对应您的 Student 页面逻辑，获取 Name, Photo, location
    const res = await fetch(`${STRAPI_URL}/api/students?pagination[pageSize]=4&sort[0]=createdAt:asc&fields[0]=Name&fields[1]=Photo&fields[2]=location&fields[3]=documentId`, { next: { revalidate: REVALIDATE_TIME } });
    const json = await res.json();
    return json.data?.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.Name || item.attributes?.Name,
      location: item.location || item.attributes?.location,
      photoUrl: item.Photo || item.attributes?.Photo || '',
    })) || [];
  } catch (error) { return []; }
}

// --- 内部组件：教师卡片 (样式：带边框卡片，4:3图片) ---
const TeacherCard = ({ teacher }: { teacher: TeacherData }) => (
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

// --- 内部组件：学生卡片 (样式：无边框，3:4图片，Location图标) ---
const StudentCard = ({ student }: { student: StudentData }) => (
  <Link href={`/students/${student.documentId}`} className="group block">
    <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 mb-3 relative">
      {student.photoUrl ? (
        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">No Photo</div>
      )}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</h3>
      {student.location && (
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <span className="mr-1">📍</span> {student.location}
        </p>
      )}
    </div>
  </Link>
);

// --- 页面主组件 ---
export default async function HomePage() {
  const [slides, notices, specialEventData, eventData, teachers, students, timers] = await Promise.all([
    getSlides(),
    getNotices(),
    getArticlesByCategory('SpecialEvent'),
    getArticlesByCategory('Event'),
    getTeachers(),
    getStudents(),
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
          <div className={`space-y-12 lg:space-y-16 ${hasTimer ? "lg:col-span-8 xl:col-span-9" : ""}`}>
            
            {/* 1. 班级热点 (原有) */}
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-7 bg-red-500 rounded-full"></div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">🔥 班级热点</h2>
              </div>
              <div className="space-y-6">
                <div className="group"><CategorySection title="特别策划" articles={specialEventData} color="bg-red-500" /></div>
                <div className="group"><CategorySection title="班级活动" articles={eventData} color="bg-orange-500" /></div>
              </div>
            </section>

            {/* 2. 师资力量 (网格布局) */}
            <section className="animate-fade-in animation-delay-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-blue-500 rounded-full"></div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">👨‍🏫 师资力量</h2>
                </div>
                <Link href="/teachers" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">查看全部 &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teachers.map(teacher => <TeacherCard key={teacher.documentId} teacher={teacher} />)}
              </div>
              {teachers.length === 0 && <p className="text-gray-400 text-sm">暂无数据</p>}
            </section>

            {/* 3. 学生风采 (网格布局) */}
            <section className="animate-fade-in animation-delay-200">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-7 bg-green-500 rounded-full"></div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">🌟 学生风采</h2>
                 </div>
                 <Link href="/students" className="text-sm text-gray-500 hover:text-green-600 transition-colors">查看全部 &rarr;</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {students.map(student => <StudentCard key={student.documentId} student={student} />)}
              </div>
              {students.length === 0 && <p className="text-gray-400 text-sm">暂无数据</p>}
            </section>

          </div>

          {/* ============ 右侧边栏 (原有) ============ */}
          {hasTimer && (
            <aside className={`${hasTimer ? "lg:col-span-4 xl:col-span-3" : "hidden"}`}>
              <div className="sticky top-20 lg:top-24 space-y-4">
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