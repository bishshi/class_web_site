'use client'

import { Bubble } from "@typebot.io/react";
import { useEffect, useState } from "react";

export default function TypebotBubble() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // 页面加载 2 秒后，预先"打开"一次 Typebot（但用户看不到）
    const timer = setTimeout(() => {
      // 触发一次打开，让它初始化
      const event = new CustomEvent('typebot-open');
      window.dispatchEvent(event);
      
      // 立即关闭
      setTimeout(() => {
        const closeEvent = new CustomEvent('typebot-close');
        window.dispatchEvent(closeEvent);
      }, 100);
      
      console.log('✅ Typebot 已预初始化');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Bubble
      typebot="classwebfeedback"
      apiHost="https://survey.biss.click"
      theme={{ button: { backgroundColor: "#000FFF" } }}
    />
  );
}