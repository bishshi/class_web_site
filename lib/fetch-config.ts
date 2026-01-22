// src/lib/fetch-config.ts

/**
 * 获取智能缓存配置
 * @param seconds 生产环境下的缓存时间（秒），默认 3 分钟 (180秒)
 */
export function getSmartCache(seconds: number = 180): RequestInit {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // 开发环境：完全不缓存，方便调试，改代码立即生效
    console.log('🔄 [Dev Mode] Fetching without cache...');
    return { cache: 'no-store' };
  } else {
    // 生产环境：使用 ISR 增量更新，避免构建报错，同时提升性能
    return { next: { revalidate: seconds } };
  }
}