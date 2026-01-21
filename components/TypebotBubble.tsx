'use client'

import { Standard } from "@typebot.io/react";
import { useState, useEffect } from "react";

// 1. 定义组件 (注意：去掉了 export const)
function TypebotBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // 这里配置你的参数
  const typebot = "classwebfeedback";
  const apiHost = "https://survey.biss.click";
  const theme = { button: { backgroundColor: "#000FFF", iconColor: "#FFFFFF" } };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {/* 聊天窗口容器 */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          width: 'calc(100vw - 40px)',
          maxWidth: '400px',
          height: 'calc(100vh - 120px)',
          maxHeight: '700px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.2s ease-in-out',
          transformOrigin: 'bottom right',
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
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: theme.button.backgroundColor,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 关闭图标 X */}
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

        {/* 气泡图标 Bubble */}
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

// 2. 核心修复：使用 export default 导出
export default TypebotBubble;