// components/RichTextRenderer.tsx
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import ReactMarkdown from 'react-markdown';

interface RichTextRendererProps {
  content: string | null | undefined;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  if (!content) return null;

  // 简单的启发式检测：如果包含常见的 HTML 闭合标签，我们认为是 HTML
  // 注意：CKEditor 输出的 HTML 通常很标准
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  // 通用样式类：使用 Tailwind Typography (prose) 自动美化
  const proseClasses = "prose prose-slate max-w-none prose-img:rounded-lg prose-a:text-blue-600 hover:prose-a:text-blue-500";

  if (isHtml) {
    // === HTML 渲染模式 ===
    // 使用 DOMPurify 清洗代码，防止 XSS 攻击
    const cleanHtml = DOMPurify.sanitize(content);
    return (
      <div 
        className={proseClasses}
        dangerouslySetInnerHTML={{ __html: cleanHtml }} 
      />
    );
  } else {
    // === Markdown 渲染模式 ===
    return (
      <div className={proseClasses}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }
}