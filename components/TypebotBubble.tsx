'use client'

import { Standard } from "@typebot.io/react";
import { useState, useEffect } from "react";

// Hook: 判断是否为移动端
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

function TypebotBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // --- 配置区域 ---
  const typebot = "classwebfeedback";
  const apiHost = "https://survey.biss.click";
  const theme = { button: { backgroundColor: "#000FFF", iconColor: "#FFFFFF" } };

  // --- 样式定义 ---

  // 1. 桌面端样式 (修改点：更宽、更高)
  const desktopStyle: React.CSSProperties = {
    bottom: '90px', 
    right: '20px',
    width: '550px',             // 宽度加宽 (原400px)
    height: '800px',            // 高度加高 (原600px)
    maxHeight: 'calc(100vh - 120px)', // 防止在小屏幕笔记本上溢出
    borderRadius: '16px',
  };

  // 2. 移动端样式 (保持之前的卡片式悬浮)
  const mobileStyle: React.CSSProperties = {
    right: '16px',
    width: 'calc(100vw - 32px)',
    bottom: '90px', 
    height: 'calc(100dvh - 120px)', 
    borderRadius: '16px', 
  };

  const currentStyle = isMobile ? mobileStyle : desktopStyle;

  return (
    <div style={{ position: 'fixed', zIndex: 9999 }}>
      
      {/* 聊天窗口容器 */}
      <div
        style={{
          position: 'fixed',
          backgroundColor: 'white',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          
          // 动画过渡
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen 
            ? 'translateY(0) scale(1)' 
            : 'translateY(20px) scale(0.95)',
          transformOrigin: 'bottom right',
          transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease',
          
          ...currentStyle, 
        }}
      >
        <Standard 
          typebot={typebot} 
          apiHost={apiHost} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
        />
      </div>

      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "关闭聊天" : "打开聊天"}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: theme.button.backgroundColor,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          transform: 'scale(1)',
          transition: 'transform 0.1s',
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {/* 关闭图标 */}
        <svg
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            fill: theme.button.iconColor,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        >
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>

        {/* 气泡图标 */}
        <svg
          viewBox="0 0 24 24"
          style={{
            position: 'absolute',
            width: '24px',
            height: '24px',
            fill: theme.button.iconColor,
            transition: 'transform 0.3s ease, opacity 0.3s ease',
            opacity: isOpen ? 0 : 1,
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </button>
    </div>
  );
}

export default TypebotBubble;