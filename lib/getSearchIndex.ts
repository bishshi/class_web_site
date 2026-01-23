'use server'

// 定义统一的搜索结果接口
export interface SearchItem {
  id: string;
  title: string;
  subTitle: string;
  href: string;
  description: string;
  image?: string;
}

export async function getSearchIndex(): Promise<SearchItem[]> {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
  
  console.log('🔍 [Search] 正在获取公共索引数据 (Articles & Teachers)...');

  // 只请求 Public 的接口
  const requests = [
    { name: 'Articles', url: `${STRAPI_URL}/api/articles?populate=*&pagination[limit]=100` },
    { name: 'Teachers', url: `${STRAPI_URL}/api/teachers?populate=*&pagination[limit]=100` },
  ];

  const results = await Promise.allSettled(
    requests.map(req => 
      fetch(req.url, { next: { revalidate: 60 } }) // ISR 缓存 60秒
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          return { name: req.name, data: json.data };
        })
    )
  );

  const allResults: SearchItem[] = [];

  results.forEach((result, index) => {
    const reqName = requests[index].name;

    if (result.status === 'rejected') {
      console.error(`❌ [${reqName}] 获取失败:`, result.reason);
      return;
    }

    const list = result.value.data;
    if (!list || !Array.isArray(list)) return;

    // --- 1. 处理文章 ---
    if (reqName === 'Articles') {
      allResults.push(...list.map((item: any) => ({
        id: `article-${item.id}`,
        title: item.title,
        subTitle: typeof item.category === 'string' ? item.category : (item.category?.name || '文章'),
        href: `/articles/${item.id}`,
        description: item.summary || item.title,
        image: (typeof item.cover === 'string' && item.cover.startsWith('http')) ? item.cover : null
      })));
    }

    // --- 2. 处理老师 ---
    if (reqName === 'Teachers') {
      allResults.push(...list.map((item: any) => ({
        id: `teacher-${item.id}`,
        title: item.Name,
        subTitle: `教师 · ${item.Subject || '未分类'}`,
        href: `/teachers/${item.id}`,
        description: item.Introduction || '暂无介绍',
        image: item.Photo?.url || null
      })));
    }
  });

  return allResults;
}