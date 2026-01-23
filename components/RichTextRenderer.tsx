"use client";
import React, { useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// ============================================================================
// 0. 新增:Wistia 播放器组件 (负责动态加载脚本)
// ============================================================================
const WistiaPlayer = ({ mediaId, aspect = "1.7777777777777777" }: { mediaId: string, aspect?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mediaId) return;

    // 1. 加载核心 Player库 (如果尚未存在)
    if (!document.getElementById("wistia-player-js")) {
      const script = document.createElement("script");
      script.src = "https://fast.wistia.com/player.js";
      script.id = "wistia-player-js";
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. 加载特定视频的 Embed 数据 (type="module")
    const specificScriptId = `wistia-embed-${mediaId}`;
    if (!document.getElementById(specificScriptId)) {
      const script = document.createElement("script");
      script.src = `https://fast.wistia.com/embed/${mediaId}.js`;
      script.id = specificScriptId;
      script.async = true;
      script.type = "module"; // Wistia V2 必须
      document.body.appendChild(script);
    }
  }, [mediaId]);

  return (
    <div className="my-8 w-full select-none !indent-0">
      <div 
        className="relative w-full overflow-hidden rounded-xl shadow-md bg-slate-100"
        // 动态计算宽高比容器,防止布局抖动
        style={{ paddingBottom: `${(1 / parseFloat(aspect)) * 100}%` }}
      >
        <div className="absolute top-0 left-0 w-full h-full">
           {/* @ts-ignore: wistia-player 是 Web Component,React TS 默认不识别 
             这里直接使用原生标签渲染
           */}
           <wistia-player media-id={mediaId} style={{ width: '100%', height: '100%' }}></wistia-player>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 1. 自定义标签处理
// ============================================================================
const processCustomTags = (content: string) => {
  if (!content) return "";
  
  // API 转义清洗
  let processed = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');

  // --- 【新增】移除人员引用标签(这些标签由 ArticleRelatedPeople 组件处理)---
  // 移除 [teacher:xxx] 和 [student:xxx] 标签,避免在正文中显示
  processed = processed.replace(/\[teacher:[^\]]+\]/g, '');
  processed = processed.replace(/\[student:[^\]]+\]/g, '');

  // --- 【新增】 Wistia 处理逻辑 ---
  
  // 🔧 关键修复:确保 custom-wistia 标签在独立的块中,不被 <p> 包裹
  // 场景 A: 用户使用短代码 [wistia id="xxxx"]
  processed = processed.replace(
    /\[wistia\s+id="([a-zA-Z0-9]+)"\]/g,
    '\n\n<div class="wistia-wrapper"><custom-wistia media-id="$1"></custom-wistia></div>\n\n'
  );

  // 场景 B: 用户粘贴了原始的 Wistia HTML 代码
  const wistiaRawRegex = /<wistia-player\s+media-id="([a-zA-Z0-9]+)"[^>]*><\/wistia-player>/g;
  processed = processed.replace(
    wistiaRawRegex, 
    '\n\n<div class="wistia-wrapper"><custom-wistia media-id="$1"></custom-wistia></div>\n\n'
  );

  // 清理残留的 wistia script 和 style 标签
  processed = processed.replace(/<script src=".*wistia.*".*><\/script>/g, '');
  processed = processed.replace(/<style>wistia-player.*<\/style>/g, '');


  // --- 原有逻辑 ---

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

  // [center]
  processed = processed.replace(
    /\[center\]([\s\S]*?)\[\/center\]/g,
    '\n\n<div class="flex flex-col items-center justify-center text-center my-6 w-full [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  // [note]
  processed = processed.replace(
    /\[note\]([\s\S]*?)\[\/note\]/g,
    '\n\n<div class="bg-blue-50 border-l-4 border-blue-500 text-slate-700 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  // [warning]
  processed = processed.replace(
    /\[warning\]([\s\S]*?)\[\/warning\]/g,
    '\n\n<div class="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  // [box]
  processed = processed.replace(
    /\[box\]([\s\S]*?)\[\/box\]/g,
    '\n\n<div class="border border-slate-200 rounded-xl p-6 my-6 bg-white shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n'
  );
  // [columns]
  processed = processed.replace(
    /\[columns\]([\s\S]*?)\[\/columns\]/g,
    '\n\n<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 w-full">\n$1\n</div>\n\n'
  );
  // [col]
  processed = processed.replace(
    /\[col\]([\s\S]*?)\[\/col\]/g,
    '\n<div class="flex flex-col [&_p]:!indent-0">\n$1\n</div>\n'
  );
  // [highlight]
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
    div: ["className", "class", "style", "data-media-id"],
    span: ["className", "class", "style"],
    img: ["className", "class", "style", "alt", "src", "width", "height"],
    table: ["className", "class", "style"],
    thead: ["className", "class", "style"],
    tbody: ["className", "class", "style"],
    tr: ["className", "class", "style"],
    th: ["className", "class", "style"],
    td: ["className", "class", "style"],
    "custom-wistia": ["media-id", "class", "className"], 
  },
  tagNames: [
    ...(defaultSchema.tagNames || []), 
    "div", "span", "figure", "figcaption", 
    "table", "thead", "tbody", "tr", "th", "td",
    "custom-wistia"
  ],
};

// ============================================================================
// 3. Markdown 渲染组件
// ============================================================================
const MarkdownViewer = ({ content }: { content: string }) => {
  const processedContent = useMemo(() => processCustomTags(content), [content]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, customSanitizeSchema]
      ]}
      components={{
        // 🔧 关键修复:处理 p 标签,防止嵌套块级元素
        p: ({ node, children, ...props }) => {
          // 检查子元素中是否包含 wistia-wrapper 或其他块级容器
          const hasBlockElement = React.Children.toArray(children).some(
            child =>
              React.isValidElement(child) &&
              child.props &&
              (child.props.className?.includes('wistia-wrapper') ||
               child.type === 'div')
          );

          // 如果包含块级元素,直接返回 fragment 不用 p 包裹
          if (hasBlockElement) {
            return <>{children}</>;
          }

          return <p {...props}>{children}</p>;
        },

        // 自定义标签映射
        // @ts-ignore
        "custom-wistia": ({ node, ...props }) => {
           const mediaId = props['media-id'] || props.mediaid;
           if (!mediaId) return null;
           return <WistiaPlayer mediaId={mediaId} />;
        },

        // 修复:使用 span 包裹而不是 figure,避免 <p> 嵌套错误
        img: ({ ...props }) => (
          <span className="my-8 flex flex-col items-center select-none !indent-0 block">
            <img
              {...props}
              className="w-auto rounded-xl shadow-md object-cover bg-gray-100"
              style={{ maxHeight: "600px" }}
              alt={props.alt || "image"}
            />
            {props.alt && (
              <span className="mt-2 text-center text-sm text-gray-500 italic block">
                {props.alt}
              </span>
            )}
          </span>
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
          <th 
            {...props} 
            className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider !indent-0 border-r border-slate-200 last:border-r-0" 
          />
        ),
        td: ({ ...props }) => (
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
  if (/\[wistia|wistia-player/.test(trimmed)) return false;
  return /^<([a-z][\s\S]*)>[\s\S]*<\/\1>$/.test(trimmed) && !/[\[\]]/.test(trimmed);
}

export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  
  const finalHtml = processCustomTags(content);
  const hasCustomComponents = /<custom-wistia/.test(finalHtml);
  const pureHtml = isPureHtml(content) && !hasCustomComponents;

  return (
    <div
      className="
        prose prose-lg prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-slate-800
        prose-p:text-slate-700 prose-p:leading-8
        
        /* 全局缩进 */
        [&_p]:indent-[2em]
        
        /* 例外:引用、图片、表格、Wistia 不需要缩进 */
        [&_blockquote_p]:!indent-0
        prose-img:!indent-0
        [&_table]:!indent-0
        [&_th]:!indent-0
        [&_td]:!indent-0
        
        /* Wistia Web Component 样式修复 */
        [&_wistia-player]:!indent-0
        [&_wistia-player]:block
        [&_.wistia-wrapper]:!indent-0
        [&_.wistia-wrapper]:block
        
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