"use client";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// ============================================================================
// 1. 自定义标签处理 (保持之前的逻辑)
// ============================================================================
const processCustomTags = (content: string) => {
  if (!content) return "";
  
  // API 转义清洗
  let processed = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');

  // [divider] 分割线
  processed = processed.replace(/\[divider\]([\s\S]*?)\[\/divider\]/g, (match, text) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return '\n\n<div class="w-full border-t-2 border-dashed border-slate-200 my-8"></div>\n\n';
    } else {
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

  // [center], [note], [warning], [box], [columns], [highlight] ...
  // (此处省略重复代码，与上一版一致，保持不变)
  processed = processed.replace(
    /\[center\]([\s\S]*?)\[\/center\]/g,
    '\n\n<div class="flex flex-col items-center justify-center text-center my-6 w-full [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  processed = processed.replace(
    /\[note\]([\s\S]*?)\[\/note\]/g,
    '\n\n<div class="bg-blue-50 border-l-4 border-blue-500 text-slate-700 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  processed = processed.replace(
    /\[warning\]([\s\S]*?)\[\/warning\]/g,
    '\n\n<div class="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  processed = processed.replace(
    /\[box\]([\s\S]*?)\[\/box\]/g,
    '\n\n<div class="border border-slate-200 rounded-xl p-6 my-6 bg-white shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  processed = processed.replace(
    /\[columns\]([\s\S]*?)\[\/columns\]/g,
    '\n\n<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 w-full">\n$1\n</div>\n\n'
  );
  processed = processed.replace(
    /\[col\]([\s\S]*?)\[\/col\]/g,
    '\n<div class="flex flex-col [&_p]:!indent-0">\n$1\n</div>\n'
  );
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
    div: ["className", "class", "style"],
    span: ["className", "class", "style"],
    img: ["className", "class", "style", "alt", "src", "width", "height"],
    // 【新增】允许表格标签携带样式
    table: ["className", "class", "style"],
    thead: ["className", "class", "style"],
    tbody: ["className", "class", "style"],
    tr: ["className", "class", "style"],
    th: ["className", "class", "style"],
    td: ["className", "class", "style"],
  },
  // 确保表格相关标签都在白名单里
  tagNames: [
    ...(defaultSchema.tagNames || []), 
    "div", "span", "figure", "figcaption", 
    "table", "thead", "tbody", "tr", "th", "td"
  ],
};

// ============================================================================
// 3. Markdown 渲染组件
// ============================================================================
const MarkdownViewer = ({ content }: { content: string }) => {
  const processedContent = useMemo(() => processCustomTags(content), [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]} // 必须包含 remarkGfm 才能解析表格语法
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, customSanitizeSchema]
      ]}
      components={{
        img: ({ ...props }) => (
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
        div: ({ ...props }) => <div {...props} className={props.className || "block"} />,

        // --- 【新增】表格样式重写 ---
        table: ({ ...props }) => (
          <div className="overflow-x-auto my-8 border border-slate-200 rounded-lg shadow-sm">
            <table {...props} className="min-w-full divide-y divide-slate-200 text-sm text-slate-700" />
          </div>
        ),
        thead: ({ ...props }) => (
          <thead {...props} className="bg-slate-50" />
        ),
        tbody: ({ ...props }) => (
          <tbody {...props} className="divide-y divide-slate-200 bg-white" />
        ),
        tr: ({ ...props }) => (
          <tr {...props} className="hover:bg-slate-50 transition-colors" />
        ),
        th: ({ ...props }) => (
          // !indent-0 强制取消缩进，text-left 强制左对齐
          <th 
            {...props} 
            className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider !indent-0 border-r border-slate-200 last:border-r-0" 
          />
        ),
        td: ({ ...props }) => (
          // !indent-0 强制取消缩进
          <td 
            {...props} 
            className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 !indent-0 border-r border-slate-200 last:border-r-0" 
          />
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

// ============================================================================
// 4. 辅助 & 主组件
// ============================================================================
function isPureHtml(text: string) {
  const trimmed = text.trim();
  if (/\\\[|\\\]/.test(trimmed)) return false; 
  return /^<([a-z][\s\S]?)>[\s\S]*<\/\1>$/.test(trimmed) && !/[\[\]]/.test(trimmed);
}

export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  
  const finalHtml = processCustomTags(content);
  const pureHtml = isPureHtml(content);

  return (
    <div
      className="
        prose prose-lg prose-slate max-w-none
        
        prose-headings:font-bold prose-headings:text-slate-800
        prose-p:text-slate-700 prose-p:leading-8
        
        /* 全局缩进 */
        [&_p]:indent-[2em]
        
        /* 例外：引用、图片、表格不需要缩进 */
        [&_blockquote_p]:!indent-0
        prose-img:!indent-0
        
        /* 注意：虽然我们在 components 里给 table 加上了样式，
           但为了保险起见，也在 CSS 层级声明 table 内不缩进 
        */
        [&_table]:!indent-0
        [&_th]:!indent-0
        [&_td]:!indent-0
        
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4
        prose-blockquote:rounded-r-lg prose-blockquote:not-italic
        prose-img:mx-auto 
        
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        
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