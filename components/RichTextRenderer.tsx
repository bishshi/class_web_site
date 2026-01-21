"use client";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// ============================================================================
// 1. 自定义标签处理核心逻辑
// ============================================================================
const processCustomTags = (content: string) => {
  if (!content) return "";
  
  // 【关键修复】API 数据清洗: 将被转义的 "\[" 和 "\]" 还原为 "[" 和 "]"
  // 解决接口返回 \[center\] 导致标签无法识别的问题
  let processed = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');

  // --- A. 分割线逻辑 [divider]内容[/divider] ---
  // 使用回调函数判断中间是否有文字
  processed = processed.replace(/\[divider\]([\s\S]*?)\[\/divider\]/g, (match, text) => {
    const trimmedText = text.trim();

    if (!trimmedText) {
      // 情况 1：纯分割线 (无文字)
      return '\n\n<div class="w-full border-t-2 border-dashed border-slate-200 my-8"></div>\n\n';
    } else {
      // 情况 2：带文字的分割线 (左虚线 + 文字 + 右虚线)
      // 注意：文字部分强制 !indent-0 取消缩进，防止排版偏右
      return `
        \n\n
        <div class="flex items-center w-full my-8">
          <div class="flex-grow border-t-2 border-dashed border-slate-200 h-px"></div>
          <span class="mx-4 text-slate-400 text-sm font-medium shrink-0 select-none !indent-0">${trimmedText}</span>
          <div class="flex-grow border-t-2 border-dashed border-slate-200 h-px"></div>
        </div>
        \n\n
      `;
    }
  });

  // --- B. 容器类标签替换 ---
  // 规则：
  // 1. 前后加 \n\n 确保 Markdown 解析器将其识别为 HTML 块级元素
  // 2. 添加 class "[&_p]:!indent-0" 强制取消盒子内部文字的缩进

  // 1. [center] 居中
  processed = processed.replace(
    /\[center\]([\s\S]*?)\[\/center\]/g,
    '\n\n<div class="flex flex-col items-center justify-center text-center my-6 w-full [&_p]:!indent-0">\n$1\n</div>\n\n'
  );

  // 2. [note] 提示框 (蓝色)
  processed = processed.replace(
    /\[note\]([\s\S]*?)\[\/note\]/g,
    '\n\n<div class="bg-blue-50 border-l-4 border-blue-500 text-slate-700 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );

  // 3. [warning] 警告框 (黄色)
  processed = processed.replace(
    /\[warning\]([\s\S]*?)\[\/warning\]/g,
    '\n\n<div class="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );

  // 4. [box] 通用盒子 (灰色边框)
  processed = processed.replace(
    /\[box\]([\s\S]*?)\[\/box\]/g,
    '\n\n<div class="border border-slate-200 rounded-xl p-6 my-6 bg-white shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );

  // 5. [columns] 多列布局 (手机单列，平板以上双列)
  processed = processed.replace(
    /\[columns\]([\s\S]*?)\[\/columns\]/g,
    '\n\n<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 w-full">\n$1\n</div>\n\n'
  );
  // 列容器内部也需取消缩进
  processed = processed.replace(
    /\[col\]([\s\S]*?)\[\/col\]/g,
    '\n<div class="flex flex-col [&_p]:!indent-0">\n$1\n</div>\n'
  );

  // --- C. 行内标签 ---
  
  // 6. [highlight] 高亮文本
  processed = processed.replace(
    /\[highlight\]([\s\S]*?)\[\/highlight\]/g,
    '<span class="bg-yellow-200 px-1 rounded mx-0.5 box-decoration-clone">$1</span>'
  );

  return processed;
};

// ============================================================================
// 2. 安全配置 (Sanitize Schema)
// ============================================================================
const customSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // 必须允许 div/span/img 携带 class 和 style，否则 Tailwind 样式会被清洗
    div: ["className", "class", "style"],
    span: ["className", "class", "style"],
    img: ["className", "class", "style", "alt", "src", "width", "height"],
  },
  // 确保这些标签被允许渲染
  tagNames: [...(defaultSchema.tagNames || []), "div", "span", "figure", "figcaption"],
};

// ============================================================================
// 3. Markdown 渲染组件
// ============================================================================
const MarkdownViewer = ({ content }: { content: string }) => {
  // 使用 useMemo 缓存处理结果，避免重复正则计算
  const processedContent = useMemo(() => processCustomTags(content), [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw, // 1. 解析 HTML 字符串
        [rehypeSanitize, customSanitizeSchema] // 2. 清洗不安全代码 (保留样式)
      ]}
      components={{
        img: ({ ...props }) => (
          // 图片容器：
          // 1. select-none: 防止选中
          // 2. !indent-0: 强制不缩进，确保图片居中
          <figure className="my-8 flex flex-col items-center select-none !indent-0">
            <img
              {...props}
              className="w-auto rounded-xl shadow-md object-cover bg-gray-100"
              style={{ maxHeight: "600px" }}
              alt={props.alt || "image"}
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
        // 拦截 div 渲染，防止布局塌陷
        div: ({ ...props }) => <div {...props} className={props.className || "block"} />,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

// ============================================================================
// 4. 辅助工具
// ============================================================================
function isPureHtml(text: string) {
  const trimmed = text.trim();
  // 如果包含 API 转义字符 (\[)，视为 Markdown 需要处理
  if (/\\\[|\\\]/.test(trimmed)) return false; 
  // 严格检查是否为纯 HTML
  return /^<([a-z][\s\S]?)>[\s\S]*<\/\1>$/.test(trimmed) && !/[\[\]]/.test(trimmed);
}

// ============================================================================
// 5. 主入口组件 (ArticleRichText)
// ============================================================================
export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  
  // 即使是纯 HTML 模式，也建议走一下标签处理，以防万一混入了 Shortcodes
  const finalHtml = processCustomTags(content);
  const pureHtml = isPureHtml(content);

  return (
    <div
      className="
        /* --- 基础排版 --- */
        prose prose-lg prose-slate max-w-none
        
        /* --- 字体与颜色 --- */
        prose-headings:font-bold prose-headings:text-slate-800
        prose-p:text-slate-700 prose-p:leading-8
        
        /* --- [核心特性] 全局首行缩进 --- */
        /* [&_p]:indent-[2em] 选中容器下所有的 p 标签，强制首行缩进 2 个字符 */
        [&_p]:indent-[2em]
        
        /* --- [核心特性] 缩进例外处理 --- */
        /* 1. 引用块内部不缩进 (!indent-0 提升优先级) */
        [&_blockquote_p]:!indent-0
        /* 2. 引用块样式优化 */
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4
        prose-blockquote:rounded-r-lg prose-blockquote:not-italic
        
        /* 3. 图片不缩进 */
        prose-img:mx-auto prose-img:!indent-0
        
        /* --- 链接样式 --- */
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        
        /* --- 保护自定义 DIV --- */
        /* 防止 prose 默认的 margin/padding 干扰我们自定义的盒子 */
        [&_div]:not-prose
      "
    >
      {pureHtml ? (
        <div dangerouslySetInnerHTML={{ __html: finalHtml }} />
      ) : (
        <MarkdownViewer content={content} />
      )}
    </div>
  );
}