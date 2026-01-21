"use client";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// --- 1. 自定义标签预处理逻辑 ---
/**
 * 将自定义的 [tag] 语法转换为带有 Tailwind 样式的 HTML
 */
const processCustomTags = (content: string) => {
  if (!content) return "";
  let processed = content;

  // 1. [center] 居中容器
  processed = processed.replace(
    /\[center\]([\s\S]*?)\[\/center\]/g,
    '<div class="flex flex-col items-center justify-center text-center my-6 w-full">$1</div>'
  );

  // 2. [note] 提示信息框 (蓝色)
  processed = processed.replace(
    /\[note\]([\s\S]*?)\[\/note\]/g,
    '<div class="bg-blue-50 border-l-4 border-blue-500 text-slate-700 p-4 my-4 rounded-r shadow-sm not-italic">$1</div>'
  );

  // 3. [warning] 警告信息框 (黄色)
  processed = processed.replace(
    /\[warning\]([\s\S]*?)\[\/warning\]/g,
    '<div class="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 my-4 rounded-r shadow-sm not-italic">$1</div>'
  );

  // 4. [box] 带边框容器 (通用)
  processed = processed.replace(
    /\[box\]([\s\S]*?)\[\/box\]/g,
    '<div class="border border-slate-200 rounded-xl p-6 my-6 bg-white shadow-sm">$1</div>'
  );

  // 5. [columns] & [col] 多列布局 (支持响应式：手机单列，平板以上双列)
  processed = processed.replace(
    /\[columns\]([\s\S]*?)\[\/columns\]/g,
    '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 w-full">$1</div>'
  );
  processed = processed.replace(
    /\[col\]([\s\S]*?)\[\/col\]/g,
    '<div class="flex flex-col">$1</div>'
  );

  // 6. [highlight] 高亮文本 (Inline)
  processed = processed.replace(
    /\[highlight\]([\s\S]*?)\[\/highlight\]/g,
    '<span class="bg-yellow-200 px-1 rounded mx-0.5 box-decoration-clone">$1</span>'
  );

  return processed;
};

// --- 2. 配置 Sanitize 安全白名单 ---
// ⚠️ 重要：必须允许 div/span 上的 className/class 属性，否则样式会被 rehype-sanitize 移除
const customSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div || []),
      "className", "class", "style"
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      "className", "class", "style"
    ],
    img: [
      ...(defaultSchema.attributes?.img || []),
      "className", "class", "style", "alt", "src", "width", "height"
    ],
  },
  // 确保 div 和 span 标签被允许渲染
  tagNames: [...(defaultSchema.tagNames || []), "div", "span", "figure", "figcaption"],
};

// --- 3. 组件部分 ---

const HtmlViewer = ({ content }: { content: string }) => {
  // 即使是纯 HTML 模式，也支持一下自定义标签，保持统一
  const processed = useMemo(() => processCustomTags(content), [content]);
  return <div dangerouslySetInnerHTML={{ __html: processed }} />;
};

const MarkdownViewer = ({ content }: { content: string }) => {
  // 核心：在渲染前先进行正则替换
  const processedContent = useMemo(() => processCustomTags(content), [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        // 使用自定义 schema 替代默认调用
        [rehypeSanitize, customSanitizeSchema] 
      ]}
      components={{
        img: ({ ...props }) => (
          <figure className="my-8 flex flex-col items-center">
            <img
              {...props}
              className="w-full rounded-xl shadow-md object-cover bg-gray-100"
              style={{ maxHeight: "600px", width: "auto" }} // 防止图片无限拉伸
              alt={props.alt || "文章配图"}
            />
            {props.alt && (
              <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
                {props.alt}
              </figcaption>
            )}
          </figure>
        ),
        a: ({ ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          />
        ),
        // 如果你需要对替换出来的 div 做进一步 React 层面的处理，可以在这里拦截
        // 但通常 Regex 里的 class 已经足够了
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

function isPureHtml(text: string) {
  const trimmed = text.trim();
  const htmlDocLike =
    /^<!doctype html>/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /^<body[\s>]/i.test(trimmed);
  const looksLikeHtmlOnly =
    /^<([a-z][\s\S]?)>[\s\S]*<\/\1>$/.test(trimmed) &&
    !/[#*`]/.test(trimmed); 
  return htmlDocLike || looksLikeHtmlOnly;
}

export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  const pureHtml = isPureHtml(content);

  return (
    <div
      // 这里的 typography 样式需要微调，以适应自定义盒子
      className="
        prose prose-lg prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-slate-800
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        
        /* 移除 prose 默认的图片样式，交由组件控制 */
        prose-img:m-0 
        
        /* 针对引用块的样式 */
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4
        prose-blockquote:not-italic prose-blockquote:rounded-r-lg
        
        /* 避免 prose 的缩进影响我们自定义容器内的排版 */
        [&_div>p]:indent-0
      "
    >
      {pureHtml ? (
        <HtmlViewer content={content} />
      ) : (
        <MarkdownViewer content={content} />
      )}
    </div>
  );
}