// lib/search.ts
import { SearchResultItem } from "@/types/search";

// 1. 获取 Strapi 地址 (优先读取环境变量，本地开发回退到 localhost)
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

// 防抖辅助函数
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 核心搜索函数
export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  if (!query.trim()) return [];

  // 2. 构建查询参数 (Strapi v5 Filters)
  // 搜文章 (匹配标题)
  const articleQuery = new URLSearchParams({
    "filters[title][$containsi]": query, // $containsi: 包含且不区分大小写
    "fields[0]": "title",
    "fields[1]": "category",
    "fields[2]": "documentId",
  });

  // 搜学生 (匹配姓名)
  const studentQuery = new URLSearchParams({
    "filters[Name][$containsi]": query,
    "fields[0]": "Name",
    "fields[1]": "documentId",
  });

  try {
    // 3. 并行请求
    const [articlesRes, studentsRes] = await Promise.all([
      fetch(`${STRAPI_URL}/api/articles?${articleQuery}`),
      fetch(`${STRAPI_URL}/api/students?${studentQuery}`),
    ]);

    // 检查 HTTP 状态，如果不是 200 OK，打印错误但不让程序崩溃
    if (!articlesRes.ok) console.warn(`Articles API Error: ${articlesRes.status}`);
    if (!studentsRes.ok) console.warn(`Students API Error: ${studentsRes.status}`);

    // 解析 JSON
    // 注意：如果 fetch 失败（比如 404/403），.json() 依然可能解析出 error 对象
    const articles = await articlesRes.json();
    const students = await studentsRes.json();

    // 4. 安全的数据映射 (修复了 "Cannot read properties of null" 错误)
    // 使用 (articles.data || []) 确保即使 data 为 null，也回退为空数组进行 map
    const formattedArticles = (articles.data || []).map((item: any) => ({
      id: item.documentId,
      title: item.title,
      category: 'article',
      subTitle: item.category || 'Article',
      href: `/article/${item.documentId}`,
    }));

    const formattedStudents = (students.data || []).map((item: any) => ({
      id: item.documentId,
      title: item.name,
      category: 'student',
      subTitle: 'Student Profile',
      href: `/students/${item.documentId}`,
    }));

    // 合并结果
    return [...formattedArticles, ...formattedStudents];

  } catch (error) {
    // 捕获网络错误 (如服务器没开)
    console.error("Global search failed:", error);
    return [];
  }
}