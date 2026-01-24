"use client";

import React, { useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// >>> 1. 引入 ViewerJS 核心库和样式
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";

// ============================================================================
// 0. Wistia 播放器 (保持不变)
// ============================================================================
const WistiaPlayer = ({ mediaId, aspect = "1.7777777777777777" }: { mediaId: string, aspect?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mediaId) return;
    if (!document.getElementById("wistia-player-js")) {
      const script = document.createElement("script");
      script.src = "https://fast.wistia.com/player.js";
      script.id = "wistia-player-js";
      script.async = true;
      document.body.appendChild(script);
    }
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
      <div className="relative w-full overflow-hidden rounded-xl shadow-md bg-slate-100" style={{ paddingBottom: `${(1 / parseFloat(aspect)) * 100}%` }}>
        <div className="absolute top-0 left-0 w-full h-full">
           {/* @ts-ignore */}
           <wistia-player media-id={mediaId} style={{ width: '100%', height: '100%' }}></wistia-player>
        </div>
      </div>
    </div>
  );
};

// ... (simpleMarkdownParser, processCustomTags, customSanitizeSchema 均保持不变，省略以节省空间，直接复制你之前的即可) ...
const simpleMarkdownParser = (text: string) => {
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
  return html;
};

const processCustomTags = (content: string) => {
  if (!content) return "";
  let processed = content.replace(/\\\[/g, '[').replace(/\\\]/g, ']');
  processed = processed.replace(/\[teacher:[^\]]+\]/g, '').replace(/\[student:[^\]]+\]/g, '');
  processed = processed.replace(/\[wistia\s+id="([a-zA-Z0-9]+)"\]/g, '\n\n<div class="wistia-wrapper"><custom-wistia media-id="$1"></custom-wistia></div>\n\n');
  const wistiaRawRegex = /<wistia-player\s+media-id="([a-zA-Z0-9]+)"[^>]*><\/wistia-player>/g;
  processed = processed.replace(wistiaRawRegex, '\n\n<div class="wistia-wrapper"><custom-wistia media-id="$1"></custom-wistia></div>\n\n');
  processed = processed.replace(/<script src=".*wistia.*".*><\/script>/g, '').replace(/<style>wistia-player.*<\/style>/g, '');
  
  // Timeline
  processed = processed.replace(/\[timeline\]([\s\S]*?)\[\/timeline\]/g, (match, innerContent) => {
      const lines = innerContent.match(/^\s*[*|-]\s+(.*)$/gm);
      if (!lines || lines.length === 0) return '';
      const itemsHtml = lines.map((line: string) => {
        const cleanLine = line.replace(/^\s*[*|-]\s+/, '').trim();
        const firstColonIndex = cleanLine.indexOf(':');
        let date = '', rawText = cleanLine;
        if (firstColonIndex > -1) { date = cleanLine.substring(0, firstColonIndex).trim(); rawText = cleanLine.substring(firstColonIndex + 1).trim(); }
        const contentHtml = simpleMarkdownParser(rawText);
        return `<div class="relative pl-8 sm:pl-44 py-2 group !indent-0"><div class="font-mono text-sm text-slate-500 mb-1 sm:mb-0 sm:absolute sm:left-0 sm:w-36 sm:text-right font-bold group-hover:text-blue-600 transition-colors flex items-center justify-start sm:justify-end h-6 sm:h-auto leading-6">${date}</div><div class="absolute left-2.5 sm:left-[10.4rem] top-[0.65rem] sm:top-5 w-3 h-3 bg-white rounded-full border-2 border-slate-300 group-hover:border-blue-500 group-hover:scale-125 transition-all z-20 box-content"></div><div class="hidden sm:block absolute left-[11rem] top-[1.6rem] w-4 h-px bg-slate-200 group-hover:bg-blue-200 transition-colors"></div><div class="text-slate-700 bg-white p-4 rounded-lg border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-blue-200 transition-all relative z-10">${contentHtml}</div></div>`;
      }).join('');
      return `\n\n<div class="relative my-10 ml-1 sm:ml-0 !indent-0 select-none"><div class="absolute left-[1.1rem] sm:left-[10.8rem] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div><div class="flex flex-col gap-4">${itemsHtml}</div></div>\n\n`;
  });

  // Other Tags
  processed = processed.replace(/\[divider\]([\s\S]*?)\[\/divider\]/g, (match, text) => !text.trim() ? '\n\n<div class="w-full border-t-2 border-dashed border-slate-200 my-8"></div>\n\n' : `\n\n<div class="flex items-center w-full my-8"><div class="flex-grow border-t-2 border-dashed border-slate-200 h-px"></div><span class="mx-4 text-slate-400 text-sm font-medium shrink-0 select-none !indent-0">${text.trim()}</span><div class="flex-grow border-t-2 border-dashed border-slate-200 h-px"></div></div>\n\n`);
  processed = processed.replace(/\[center\]([\s\S]*?)\[\/center\]/g, '\n\n<div class="flex flex-col items-center justify-center text-center my-6 w-full [&_p]:!indent-0">\n$1\n</div>\n\n');
  processed = processed.replace(/\[note\]([\s\S]*?)\[\/note\]/g, '\n\n<div class="bg-blue-50 border-l-4 border-blue-500 text-slate-700 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n');
  processed = processed.replace(/\[warning\]([\s\S]*?)\[\/warning\]/g, '\n\n<div class="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 my-4 rounded-r shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n');
  processed = processed.replace(/\[box\]([\s\S]*?)\[\/box\]/g, '\n\n<div class="border border-slate-200 rounded-xl p-6 my-6 bg-white shadow-sm [&_p]:!indent-0">\n$1\n</div>\n\n');
  processed = processed.replace(/\[columns\]([\s\S]*?)\[\/columns\]/g, '\n\n<div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 w-full">\n$1\n</div>\n\n');
  processed = processed.replace(/\[col\]([\s\S]*?)\[\/col\]/g, '\n<div class="flex flex-col [&_p]:!indent-0">\n$1\n</div>\n');
  processed = processed.replace(/\[highlight\]([\s\S]*?)\[\/highlight\]/g, '<span class="bg-yellow-200 px-1 rounded mx-0.5 box-decoration-clone">$1</span>');
  return processed;
};

const customSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: ["className", "class", "style", "data-media-id"],
    span: ["className", "class", "style"],
    img: ["className", "class", "style", "alt", "src", "width", "height"],
    table: ["className", "class", "style"],
    "custom-wistia": ["media-id", "class", "className"], 
  },
  tagNames: [...(defaultSchema.tagNames || []), "div", "span", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "custom-wistia"],
};

// ============================================================================
// Markdown Viewer (集成 ViewerJS)
// ============================================================================
const MarkdownViewer = ({ content }: { content: string }) => {
  const processedContent = useMemo(() => processCustomTags(content), [content]);
  
  // >>> 2. 定义容器 Ref 和 Viewer 实例 Ref
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  // >>> 3. 初始化 ViewerJS
  useEffect(() => {
    // 确保容器存在
    if (!containerRef.current) return;

    // 如果内容更新，先销毁旧实例
    if (viewerRef.current) {
      viewerRef.current.destroy();
    }

    // 创建新实例
    viewerRef.current = new Viewer(containerRef.current, {
      // 配置项：你可以根据需要开关
      button: true,       // 右上角关闭按钮
      navbar: true,       // 底部缩略图导航
      title: false,       // 是否显示图片标题（我觉得关掉比较清爽）
      toolbar: {          // 工具栏配置 (1:显示, 0:隐藏, 'large':大图标)
        zoomIn: 1,
        zoomOut: 1,
        oneToOne: 1,
        reset: 1,
        prev: 1,
        play: { show: 1, size: 'large' }, // 幻灯片播放
        next: 1,
        rotateLeft: 1,    // 左旋转
        rotateRight: 1,   // 右旋转
        flipHorizontal: 1,// 水平翻转
        flipVertical: 1,  // 垂直翻转
      },
      // 过滤器：只查看带有特定class的图片，或者排除掉头像等
      // filter: (image) => image.classList.contains('gallery-image'), 
    });

    // 清理函数
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
      }
    };
  }, [content]); // 当 content 变化导致 DOM 重绘时，重新绑定 Viewer

  return (
    // >>> 4. 将 Ref 绑定到最外层容器
    <div ref={containerRef}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, customSanitizeSchema]]}
        components={{
          p: ({ node, children, ...props }) => {
             const hasBlockElement = React.Children.toArray(children).some(child => {
               if (!React.isValidElement(child)) return false;
               const childProps = child.props as any;
               return (childProps?.className?.includes('wistia-wrapper') || child.type === 'div');
             });
             return hasBlockElement ? <>{children}</> : <p {...props}>{children}</p>;
          },
          // @ts-ignore
          "custom-wistia": ({ node, ...props }) => {
             const mediaId = props['media-id'] || props.mediaid;
             return mediaId ? <WistiaPlayer mediaId={mediaId} /> : null;
          },
          
          // >>> 5. 简化 Img 组件：移除所有点击事件
          // ViewerJS 会通过 DOM 自动监听容器内所有 <img> 的点击
          img: ({ ...props }) => {
            return (
              <span className="my-8 flex flex-col items-center select-none !indent-0 block">
                <img
                  {...props}
                  // 添加 cursor-zoom-in 提示用户可点击
                  className="w-auto rounded-xl shadow-md object-cover bg-gray-100 cursor-zoom-in hover:opacity-95 transition-opacity"
                  style={{ maxHeight: "600px" }}
                  alt={props.alt || "image"}
                />
                {props.alt && <span className="mt-2 text-center text-sm text-gray-500 italic block">{props.alt}</span>}
              </span>
            );
          },
          
          // 其他组件保持不变...
          a: ({ ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors" />,
          div: ({ ...props }) => <div {...props} className={props.className || "block"} />,
          table: ({ ...props }) => <div className="overflow-x-auto my-8 border border-slate-200 rounded-lg shadow-sm"><table {...props} className="min-w-full divide-y divide-slate-200 text-sm text-slate-700" /></div>,
          thead: ({ ...props }) => <thead {...props} className="bg-slate-50" />,
          tbody: ({ ...props }) => <tbody {...props} className="divide-y divide-slate-200 bg-white" />,
          tr: ({ ...props }) => <tr {...props} className="hover:bg-slate-50 transition-colors" />,
          th: ({ ...props }) => <th {...props} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider !indent-0 border-r border-slate-200 last:border-r-0" />,
          td: ({ ...props }) => <td {...props} className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 !indent-0 border-r border-slate-200 last:border-r-0" />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  return (
    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700 prose-p:leading-8 [&_p]:indent-[2em] [&_blockquote_p]:!indent-0 prose-img:!indent-0 [&_table]:!indent-0 [&_th]:!indent-0 [&_td]:!indent-0 [&_wistia-player]:!indent-0 [&_wistia-player]:block [&_.wistia-wrapper]:!indent-0 [&_.wistia-wrapper]:block [&_.relative]:!indent-0 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-img:mx-auto prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline [&_div]:not-prose">
      <MarkdownViewer content={content} />
    </div>
  );
}