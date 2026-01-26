// components/MatomoTracker.tsx
'use client'; // 必须声明为客户端组件

import { useMatomo } from '@/hooks/useMatomo';

export default function MatomoTracker() {
  // 替换为你的真实 URL
  useMatomo('https://statistic.biss.click/js/container_9W0A3pP7.js'); 
  
  return null; // 该组件不渲染任何内容
}