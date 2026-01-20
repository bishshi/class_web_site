'use client';

export default function LocationMap() {
  // 提示：你可以去高德地图官网搜索你的学校，点击"分享"->"嵌入地图"，获取 src 链接替换下面这个
  // 下面这个链接是示例（指向北京大学）
  const mapUrl = "https://www.amap.com/place/B000A816R6"; 
  
  // 或者使用更纯净的嵌入方式（如果需要 API 功能则需要去高德开放平台申请 Key）
  // 这里我们为了简单美观，模拟一个地图容器，实际开发中建议替换为真实的 iframe
  
  return (
    <div className="w-full h-full relative group">
      {/* 使用 iframe 嵌入地图 */}
      <iframe
        className="w-full h-full border-0 filter grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
        src="https://mapapi.qq.com/web/mapComponents/locationMarker/v/index.html?type=0&marker=coord%3A35.764528%2C112.967098%3Btitle%3A%E9%AB%98%E5%B9%B3%E5%B8%82%E7%AC%AC%E4%B8%80%E4%B8%AD%E5%AD%A6%3Baddr%3A%E5%B1%B1%E8%A5%BF%E7%9C%81%E6%99%8B%E5%9F%8E%E5%B8%82%E9%AB%98%E5%B9%B3%E5%B8%82%E7%AC%AC%E4%B8%80%E4%B8%AD%E5%AD%A6&key=FRTBZ-NCM6Q-D4W5K-2KMNK-CB5ZQ-UXBOV&referer=myapp"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
      
      {/* 装饰性的遮罩，让地图在不交互时看起来更柔和，符合你的 Design System */}
      <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-3xl ring-1 ring-inset ring-black/5"></div>
      
      {/* 右下角提示标签 */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-xs font-medium text-slate-600 shadow-sm border border-slate-200">
        位置指引
      </div>
    </div>
  );
}