// api.ts
// lib/api.ts
export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
export async function fetchFromStrapi(endpoint: string) {
  // 拼接 URL，例如: http://127.0.0.1:1337/api/students?populate=*
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    cache: "no-store", // 开发时建议不缓存，刷新即变
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data from ${endpoint}`);
  }

  const json = await res.json();
  return json.data; // 直接把 data 这一层剥离出来返回
}