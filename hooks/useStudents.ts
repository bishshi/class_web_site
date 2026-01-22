// hooks/useStudents.ts
import useSWR from 'swr';
import { isAuthenticated } from '@/lib/auth';
import { Student } from '@/types/student'; // 确保引入你的类型定义

// 定义 Fetcher 函数
const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const json = await res.json();
  
  // 1. 格式化数据 (适配你的 API 结构)
  const rawData = json.data || [];
  
  // 2. 统一在这里做中文拼音排序
  const sortedData = rawData.sort((a: any, b: any) => {
    // 假设 API 返回字段是 Name，如果是 name 请自行调整
    const nameA = a.Name || a.name || '';
    const nameB = b.Name || b.name || '';
    return nameA.localeCompare(nameB, 'zh-CN');
  });

  return sortedData;
};

export function useStudents() {
  const isLoggedIn = isAuthenticated();

  // SWR 的 key 机制：
  // 如果 key 是 null，SWR 就不会发起请求 (实现了类似之前的 if (loggedIn) 逻辑)
  // 我们请求 pageSize=1000 确保拿到所有人
  const key = isLoggedIn 
    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/students?fields[0]=Name&fields[1]=Photo&fields[2]=location&fields[3]=documentId&pagination[pageSize]=1000` 
    : null;

  const { data, error, isLoading } = useSWR(key, fetcher, {
    // 缓存配置
    revalidateOnFocus: false, // 窗口重新聚焦时不重新请求（除非你想实时性很高）
    dedupingInterval: 60000,  // 1分钟内重复调用直接用缓存，不发请求
  });

  return {
    students: (data as Student[]) || [],
    isLoading,
    isError: error,
    isLoggedIn
  };
}