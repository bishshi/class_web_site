'use client';

import { useState, useEffect } from 'react';
import { getTimeGreeting, getWelcomeMessage } from '@/types/welcome-message';

// 腾讯地图 API 返回的数据结构
interface TencentLocationResponse {
  status: number;
  message: string;
  result: {
    ip: string;
    location: {
      lng: number;
      lat: number;
    };
    ad_info: {
      nation: string;
      province: string;
      city: string;
      district: string;
    };
  };
}

// 计算两点之间的距离（单位：公里）
function getDistance(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const R = 6371; // 地球半径（公里）
  const { sin, cos, asin, PI, hypot } = Math;
  
  const toRad = (deg: number) => (deg * PI) / 180;
  
  const getPoint = (lng: number, lat: number) => {
    const lngRad = toRad(lng);
    const latRad = toRad(lat);
    return {
      x: cos(latRad) * cos(lngRad),
      y: cos(latRad) * sin(lngRad),
      z: sin(latRad)
    };
  };
  
  const a = getPoint(lng1, lat1);
  const b = getPoint(lng2, lat2);
  const c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  const r = asin(c / 2) * 2 * R;
  
  return Math.round(r);
}

export default function WelcomeCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [locationData, setLocationData] = useState<{
    location: string;
    ip: string;
    distance: number;
    message: string;
    greeting: { emoji: string; text: string };
  } | null>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      setError(false);

      // 获取 API Key（优先使用环境变量）
      const apiKey = process.env.NEXT_PUBLIC_TENCENT_MAP_KEY;
      
      if (!apiKey) {
        console.error('腾讯地图 API Key 未配置');
        setError(true);
        setLoading(false);
        return;
      }

      // 调用腾讯地图 API（JSONP 方式）
      const script = document.createElement('script');
      const callbackName = `tencentMapCallback_${Date.now()}`;
      
      // 定义全局回调函数
      (window as any)[callbackName] = (data: TencentLocationResponse) => {
        if (data.status === 0 && data.result) {
          const { ip, location, ad_info } = data.result;
          
          // 计算距离（目标坐标：太原，112.92358, 35.79807）
          const dist = getDistance(112.92358, 35.79807, location.lng, location.lat);
          
          // 构建位置字符串
          let pos = ad_info.nation;
          if (ad_info.nation === "中国") {
            pos = `${ad_info.province} ${ad_info.city} ${ad_info.district}`;
          }
          
          // 获取欢迎语
          const message = getWelcomeMessage(ad_info.nation, ad_info.province, ad_info.city);
          
          // 获取时间问候
          const greeting = getTimeGreeting();
          
          setLocationData({
            location: pos,
            ip,
            distance: dist,
            message,
            greeting
          });
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
        
        // 清理
        document.body.removeChild(script);
        delete (window as any)[callbackName];
      };
      
      // 创建 JSONP 请求（使用环境变量中的 API Key）
      script.src = `https://apis.map.qq.com/ws/location/v1/ip?key=${apiKey}&output=jsonp&callback=${callbackName}`;
      script.onerror = () => {
        setError(true);
        setLoading(false);
        document.body.removeChild(script);
        delete (window as any)[callbackName];
      };
      
      document.body.appendChild(script);
      
    } catch (err) {
      console.error('获取位置信息失败:', err);
      setError(true);
      setLoading(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-sm text-slate-500 text-center mt-3">正在获取位置信息...</p>
      </div>
    );
  }

  // 错误状态
  if (error || !locationData) {
    return (
      <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
        <div className="text-center">
          <div className="text-4xl mb-3">🌍</div>
          <p className="text-slate-600 text-sm leading-relaxed">
            欢迎访问！<br />
            位置信息获取失败
          </p>
          <button
            onClick={fetchLocation}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  // 正常显示
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-6 border border-slate-200/60 shadow-sm">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">{locationData.greeting.emoji}</span>
        <h3 className="text-lg font-bold text-slate-800">{locationData.greeting.text}</h3>
      </div>

      {/* 位置信息 */}
      <div className="space-y-3 text-sm leading-relaxed">
        <p className="text-slate-700">
          欢迎来自{' '}
          <span className="font-bold text-blue-600">{locationData.location}</span>
          {' '}的小友 💖
        </p>
        
        <p className="text-slate-600">
          {locationData.message} 🍂
        </p>
        
        <p className="text-slate-700">
          当前位置距高平市约{' '}
          <span className="font-bold text-purple-600">{locationData.distance}</span>
          {' '}公里！
        </p>
        
        {/* IP 地址（脱敏显示） */}
        <p className="text-slate-500 text-xs">
          您的 IP：
          <span className="font-mono bg-slate-100 px-2 py-1 rounded ml-1">
            {locationData.ip.split('.').slice(0, 2).join('.')}.***.***
          </span>
        </p>
      </div>

      {/* 底部装饰 */}
{/*       <div className="mt-4 pt-4 border-t border-slate-200/60">
        <p className="text-xs text-slate-400 text-center">
          📍 基于腾讯地图定位服务
        </p>
      </div> */}
    </div>
  );
}