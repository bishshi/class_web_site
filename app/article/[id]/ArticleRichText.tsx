"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- 1. 定义 HTML 渲染子组件 ---
const HtmlViewer = ({ content }: { content: string }) => {
  return (
    <div 
      // HTML 模式下，直接注入 HTML 字符串
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
};

// --- 2. 定义 Markdown 渲染子组件 ---
const MarkdownViewer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 修复 Markdown 图片显示
        img: ({ node, ...props }) => (
          <figure className="my-10">
            <img
              {...props}
              className="w-full rounded-xl shadow-lg object-cover bg-gray-100"
              style={{ maxHeight: '600px' }}
              alt={props.alt || "文章配图"}
            />
            {props.alt && (
              <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
                {props.alt}
              </figcaption>
            )}
          </figure>
        ),
        // 链接新标签页打开
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// --- 3. 智能主组件 (分流器) ---
export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;

  // 🕵️‍♀️ 核心逻辑：侦测是否为 HTML
  // 规则：如果字符串以 < 开头（忽略空格），并且包含闭合标签，我们认为是 HTML
  // CKEditor 生成的 HTML 通常以 <p>, <h1>, <figure> 开头
  const isHtml = /^\s*<[a-z][\s\S]*>/i.test(content);

  return (
    <div className="prose prose-lg prose-slate max-w-none 
      prose-headings:font-bold prose-headings:text-slate-800 
      prose-p:text-slate-600 prose-p:leading-relaxed 
      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg"
    >
      {isHtml ? (
        //如果是 HTML，用 HTML 渲染器
        <HtmlViewer content={content} />
      ) : (
        // 否则，认为是 Markdown，用 Markdown 渲染器
        <MarkdownViewer content={content} />
      )}
    </div>
  );
}