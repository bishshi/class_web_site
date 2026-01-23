// components/Watermark.tsx
import React from 'react';

const Watermark = () => {
  return (
    <div 
      className="fixed bottom-4 left-4 z-50 pointer-events-none select-none opacity-50"
    >
      {/* 你可以在这里放文字，也可以放 Logo 图片 */}
      <div className="text-gray-400 text-sm font-mono">
        <p>Class 612</p>
        <p>Internal Use Only</p>
      </div>
      
      {/* 如果使用图片水印，取消下面注释 */}
      {/* <img 
        src="/logo.png" 
        alt="Watermark" 
        className="w-24 h-auto opacity-30" 
      /> 
      */}
    </div>
  );
};

export default Watermark;