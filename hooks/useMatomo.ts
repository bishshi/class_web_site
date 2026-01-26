import { useEffect } from 'react';

// 1. 定义 Matomo 容器内推送到数组的数据类型
interface MatomoEvent {
  event: string;
  'mtm.startTime'?: number;
  [key: string]: any; // 允许其他自定义参数
}

// 2. 扩展全局 window 接口
declare global {
  interface Window {
    _mtm: MatomoEvent[];
  }
}

export const useMatomo = (containerUrl: string): void => {
  useEffect(() => {
    // 基础校验
    if (!containerUrl) return;

    // 防止在严格模式或路由重定向时重复插入脚本
    if (document.querySelector(`script[src="${containerUrl}"]`)) {
      return;
    }

    // 初始化 _mtm 数组
    window._mtm = window._mtm || [];
    window._mtm.push({ 
      'mtm.startTime': new Date().getTime(), 
      'event': 'mtm.Start' 
    });

    // 创建脚本元素
    const script = document.createElement('script');
    script.src = containerUrl;
    script.async = true;

    // 插入到 DOM 中
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }, [containerUrl]);
};