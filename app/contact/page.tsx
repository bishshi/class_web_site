import LocationMap from '@/components/LocationMap';

export const metadata = {
  title: '联系我们 - 班级主页',
  description: '查看我们的联系方式和地理位置。',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. 头部标题 */}
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            联系方式
          </h1>
          <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
            欢迎随时与我们交流。这里是我们班级的官方联络渠道与线下活动常驻地。
          </p>
        </div>
      </div>

      {/* 2. 信息展示区 (Grid 布局) */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          
          {/* 邮箱 */}
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">电子邮箱</h3>
              <p className="mt-2 text-slate-600">无</p>
              <p className="text-slate-500 text-sm mt-1">欢迎骚扰</p>
            </div>
          </div>

          {/* 地址 */}
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">所在位置</h3>
              <p className="mt-2 text-slate-600">山西省 晋城市 高平市 第一中学</p>
              <p className="text-slate-500 text-sm mt-1"> </p>
            </div>
          </div>

          {/* 社交/其他 */}
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">班级群组</h3>
              <p className="mt-2 text-slate-600">QQ群：保密</p>
              <p className="text-slate-500 text-sm mt-1">微信公众号：2024届612</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. 地图组件区域 */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl overflow-hidden h-[400px] md:h-[500px] relative">
          <LocationMap />
        </div>
      </div>
    </div>
  );
}