'use server'

// 定义统一的搜索结果接口，供前端使用
export interface SearchItem {
  id: string;
  title: string;
  subTitle: string;
  href: string;
  description: string;
  image?: string;
}

export async function getSearchIndex(): Promise<SearchItem[]> {
  // 如果 .env 没有配置 URL，默认使用 localhost:1337
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';


  console.log('🔍 [Search] 开始获取全站索引数据 (Public Mode)...');

  // 定义要抓取的三个接口
  const requests = [
    { name: 'Articles', url: `${STRAPI_URL}/api/articles?populate=*&pagination[limit]=100` },
    { name: 'Teachers', url: `${STRAPI_URL}/api/teachers?populate=*&pagination[limit]=100` },
    { name: 'Students', url: `${STRAPI_URL}/api/students?populate=*&pagination[limit]=100` },
  ];

  // 使用 allSettled：即使"学生"接口挂了，"文章"依然能显示，不会全军覆没
  const results = await Promise.allSettled(
    requests.map(req => 
      fetch(req.url, { next: { revalidate: 60 } }) // 60秒缓存，确保速度
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          return { name: req.name, data: json.data };
        })
    )
  );

  const allResults: SearchItem[] = [];

  // 遍历结果并清洗数据
  results.forEach((result, index) => {
    const reqName = requests[index].name;

    if (result.status === 'rejected') {
      console.error(`❌ [${reqName}] 获取失败:`, result.reason);
      return;
    }

    const list = result.value.data;
    if (!list || !Array.isArray(list)) return;

    console.log(`✅ [${reqName}] 获取成功，数量: ${list.length}`);

    // --- 1. 处理文章 (Articles) ---
    if (reqName === 'Articles') {
      allResults.push(...list.map((item: any) => ({
        id: `article-${item.id}`,
        title: item.title,
        subTitle: typeof item.category === 'string' ? item.category : (item.category?.name || '文章'),
        href: `/articles/${item.id}`, // 这里用了 ID 跳转
        description: item.summary || item.title, // 优先使用 summary
        // 处理脏数据：确保 cover 是 http 开头的链接，否则设为 null
        image: (typeof item.cover === 'string' && item.cover.startsWith('http')) ? item.cover : null
      })));
    }

    // --- 2. 处理老师 (Teachers) ---
    if (reqName === 'Teachers') {
      allResults.push(...list.map((item: any) => ({
        id: `teacher-${item.id}`,
        title: item.Name, // 注意 API 返回是大写 Name
        subTitle: `教师 · ${item.Subject || '未分类'}`,
        href: `/teachers/${item.id}`,
        description: item.Introduction || '暂无介绍',
        image: item.Photo?.url || null
      })));
    }

    // --- 3. 处理学生 (Students) ---
    if (reqName === 'Students') {
      allResults.push(...list.map((item: any) => ({
        id: `student-${item.id}`,
        title: item.Name,
        subTitle: '学生',
        href: `/students/${item.id}`,
        description: item.Introduction || item.Email || '暂无介绍',
        image: item.Photo?.url || null
      })));
    }
  });

  console.log(`🎉 [Search] 最终合并索引: ${allResults.length} 条数据`);
  return allResults;
}