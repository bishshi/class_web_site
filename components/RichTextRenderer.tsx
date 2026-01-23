"use client";
import React, { useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// ============================================================================
// 0. Wistia 播放器组件
// ============================================================================
const WistiaPlayer = ({ mediaId, aspect = "1.7777777777777777" }: { mediaId: string, aspect?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mediaId) return;

    // 1. 加载核心 Player库
    if (!document.getElementById("wistia-player-js")) {
      const script = document.createElement("script");
      script.src = "https://fast.wistia.com/player.js";
      script.id = "wistia-player-js";
      script.async = true;
      document.body.appendChild(script);
    }

    // 2. 加载特定视频的 Embed 数据
    const specificScriptId = `wistia-embed-${mediaId}`;
    if (!document.getElementById(specificScriptId)) {
      const script = document.createElement("script");
      script.src = `https://fast.wistia.com/embed/${mediaId}.js`;
      script.id = specificScriptId;
      script.async = true;
      script.type = "module";
      document.body.appendChild(script);
    }
  }, [mediaId]);

  return (
    <div className="my-8 w-full select-none !indent-0">
      <div 
        className="relative w-full overflow-hidden rounded-xl shadow-md bg-slate-100"
        style={{ paddingBottom: `${(1 / parseFloat(aspect)) * 100}%` }}
      >
        <div className="absolute top-0 left-0 w-full h-full">
           {/* @ts-ignore: Web Component */}
           <wistia-player media-id={mediaId} style={{ width: '100%', height: '100%' }}></wistia-player>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 1. 自定义标签处理逻辑
// ============================================================================

// 辅助：简单的行内 Markdown 解析器 (用于 Timeline 内部，支持加粗、斜体、链接)
const simpleMarkdownParser = (text: string) => {
  let html = text;
  // **Bold**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>');
  // *Italic*
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>');
  // [Link](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
  return html;
};

const processCustomTags = (content: string) => {
  if (!content) return "";
  
  // API 转义清洗
  let processed = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');

  // 1. 移除不应在正文中显示的人员标签
  processed = processed.replace(/\[teacher:[^\]]+\]/g, '');
  processed = processed.replace(/\[student:[^\]]+\]/g, '');

  // 2. Wistia 视频处理 (确保顶格，防止缩进被识别为代码块)
  processed = processed.replace(
    /\[wistia\s+id="([a-zA-Z0-9]+)"\]/g,
    '\n\n<div class="wistia-wrapper"><custom-wistia media-id="$1"></custom-wistia></div>\n\n'
  );

  const wistiaRawRegex = /<wistia-player\s+media-id="([a-zA-Z0-9]+)"[^>]*><\/wistia-player>/g;
  processed = processed.replace(
    wistiaRawRegex, 
    '\n\n<div class="wistia-wrapper"><custom-wistia media-id="$1"></custom-wistia></div>\n\n'
  );
  
  // 清理残留标签
  processed = processed.replace(/<script src=".*wistia.*".*><\/script>/g, '');
  processed = processed.replace(/<style>wistia-player.*<\/style>/g, '');


  // 3. ✨ Timeline 时间轴 (关键修复：移除 HTML 缩进)
  processed = processed.replace(
    /\[timeline\]([\s\S]*?)\[\/timeline\]/g,
    (match, innerContent) => {
      // 提取列表项
      const lines = innerContent.match(/^\s*[*|-]\s+(.*)$/gm);
      if (!lines || lines.length === 0) return '';

      const itemsHtml = lines.map((line: string) => {
        const cleanLine = line.replace(/^\s*[*|-]\s+/, '').trim();
        const firstColonIndex = cleanLine.indexOf(':');
        
        let date = '';
        let rawText = cleanLine;

        if (firstColonIndex > -1) {
           date = cleanLine.substring(0, firstColonIndex).trim();
           rawText = cleanLine.substring(firstColonIndex + 1).trim();
        }

        // 解析内部 Markdown
        const contentHtml = simpleMarkdownParser(rawText);

        // 返回单行紧凑 HTML，避免 Markdown 将缩进解析为代码块
        return `<div class="relative pl-8 sm:pl-44 py-2 group !indent-0"><div class="font-mono text-sm text-slate-500 mb-1 sm:mb-0 sm:absolute sm:left-0 sm:w-36 sm:text-right font-bold group-hover:text-blue-600 transition-colors flex items-center justify-start sm:justify-end h-6 sm:h-auto leading-6">${date}</div><div class="absolute left-2.5 sm:left-[10.4rem] top-[0.65rem] sm:top-5 w-3 h-3 bg-white rounded-full border-2 border-slate-300 group-hover:border-blue-500 group-hover:scale-125 transition-all z-20 box-content"></div><div class="hidden sm:block absolute left-[11rem] top-[1.6rem] w-4 h-px bg-slate-200 group-hover:bg-blue-200 transition-colors"></div><div class="text-slate-700 bg-white p-4 rounded-lg border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all relative z-10">${contentHtml}</div></div>`;
      }).join('');

      // 外层容器也移除缩进
      return `\n\n<div class="relative my-10 ml-1 sm:ml-0 !indent-0 select-none"><div class="absolute left-[1.1rem] sm:left-[10.8rem] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div><div class="flex flex-col gap-4">${itemsHtml}</div></div>\n\n`;
    }
  );

  // 4. 其他自定义标签 (全部移除缩进)

  // [divider]
  processed = processed.replace(/\[divider\]([\s\S]*?)\[\/divider\]/g, (match, text) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      return '\n\n<div class="w-full border-t-2 border-dashed border-slate-200 my-8"></div>\n\n';
    } else {
      return `\n\n<div class="flex items-center w-full my-8"><div class="flex-grow border-t-2 border-dashed border-slate-200 h-px"></div><span class="mx-4 text-slate-400 text-sm font-medium shrink-0 select-none !indent-0">${trimmedText}</span><div class="flex-grow border-t-2 border-dashed border-slate-200 h-px"></div></div>\n\n`;
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
    a: ["href", "className", "class", "target", "rel", "style"],
    strong: ["className", "class"],
    em: ["className", "class"],
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
        // 修复: P 标签不能嵌套块级元素 (div)
        p: ({ node, children, ...props }) => {
          const hasBlockElement = React.Children.toArray(children).some(
            child => {
              if (!React.isValidElement(child)) return false;
              const childProps = child.props as any;
              return (
                childProps?.className?.includes('wistia-wrapper') ||
                child.type === 'div'
              );
            }
          );
          if (hasBlockElement) {
            return <>{children}</>;
          }
          return <p {...props}>{children}</p>;
        },
        // Wistia 映射
        // @ts-ignore
        "custom-wistia": ({ node, ...props }) => {
           const mediaId = props['media-id'] || props.mediaid;
           if (!mediaId) return null;
           return <WistiaPlayer mediaId={mediaId} />;
        },
        // 图片优化
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
        // 链接优化
        a: ({ ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          />
        ),
        // 表格优化
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
// 4. 主组件
// ============================================================================
function isPureHtml(text: string) {
  const trimmed = text.trim();
  if (/\\\[|\\\]/.test(trimmed)) return false; 
  if (/\[wistia|wistia-player/.test(trimmed)) return false;
  if (/\[timeline\]/.test(trimmed)) return false;
  // 检测其他自定义标签
  if (/\[(divider|center|note|warning|box|columns|col|highlight)\]/.test(trimmed)) return false;
  
  return /^<([a-z][\s\S]*)>[\s\S]*<\/\1>$/.test(trimmed) && !/[\[\]]/.test(trimmed);
}

export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  
  const finalHtml = processCustomTags(content);
  const hasCustomComponents = /<custom-wistia|<div class="relative/.test(finalHtml); 
  const pureHtml = isPureHtml(content) && !hasCustomComponents;

  return (
    <div
      className="
        prose prose-lg prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-slate-800
        prose-p:text-slate-700 prose-p:leading-8
        
        /* 全局首行缩进 */
        [&_p]:indent-[2em]
        
        /* 例外列表: 防止缩进破坏布局 */
        [&_blockquote_p]:!indent-0
        prose-img:!indent-0
        [&_table]:!indent-0
        [&_th]:!indent-0
        [&_td]:!indent-0
        
        /* Wistia 和 Timeline 修复 */
        [&_wistia-player]:!indent-0
        [&_wistia-player]:block
        [&_.wistia-wrapper]:!indent-0
        [&_.wistia-wrapper]:block
        
        /* 确保 Timeline 内部不缩进 */
        [&_.relative]:!indent-0 
        
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