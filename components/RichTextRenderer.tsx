"use client";
import React, { useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// ============================================================================
// 0. 新增：Wistia 播放器组件 (负责动态加载脚本)
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
        // 动态计算宽高比容器，防止布局抖动
        style={{ paddingBottom: `${(1 / parseFloat(aspect)) * 100}%` }}
      >
        <div className="absolute top-0 left-0 w-full h-full">
           {/* @ts-ignore: wistia-player 是 Web Component，React TS 默认不识别 
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

  // --- 【新增】 Wistia 处理逻辑 ---
  
  // 场景 A: 用户使用短代码 [wistia id="xxxx"]
  processed = processed.replace(
    /\[wistia\s+id="([a-zA-Z0-9]+)"\]/g,
    '<custom-wistia media-id="$1"></custom-wistia>'
  );

  // 场景 B: 用户粘贴了原始的 Wistia HTML 代码
  // 我们使用正则提取 media-id，并将整个原始代码块替换为我们的自定义标签
  // 原始代码通常包含 <script...>, <style...>, <wistia-player...>
  // 下面的正则会匹配包含 wistia-player 的那一行或那一块
  const wistiaRawRegex = /<wistia-player\s+media-id="([a-zA-Z0-9]+)"[^>]*><\/wistia-player>/g;
  processed = processed.replace(wistiaRawRegex, '<custom-wistia media-id="$1"></custom-wistia>');

  // 清理残留的 wistia script 和 style 标签 (防止 rehype-raw 渲染出乱码或被 sanitize 过滤后留白)
  // 注意：这步是为了清理用户粘贴进来的原始 <script> 文本，因为我们已经在组件里手动加载了
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
    div: ["className", "class", "style", "data-media-id"], // 允许 data-media-id 以防万一
    span: ["className", "class", "style"],
    img: ["className", "class", "style", "alt", "src", "width", "height"],
    table: ["className", "class", "style"],
    thead: ["className", "class", "style"],
    tbody: ["className", "class", "style"],
    tr: ["className", "class", "style"],
    th: ["className", "class", "style"],
    td: ["className", "class", "style"],
    
    // 【新增】允许自定义标签携带 media-id 属性
    "custom-wistia": ["media-id", "class", "className"], 
  },
  tagNames: [
    ...(defaultSchema.tagNames || []), 
    "div", "span", "figure", "figcaption", 
    "table", "thead", "tbody", "tr", "th", "td",
    // 【新增】白名单放行自定义标签
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
        // --- 【新增】将自定义 HTML 标签映射为 React 组件 ---
        // @ts-ignore: types for custom-wistia aren't strict in react-markdown
        "custom-wistia": ({ node, ...props }) => {
           // 注意：rehype 传递属性时，会将 media-id 转为 mediaId 吗？通常会保留或转为小写。
           // 我们直接从 props 获取 'media-id' 或 'mediaid'
           const mediaId = props['media-id'] || props.mediaid;
           if (!mediaId) return null;
           return <WistiaPlayer mediaId={mediaId} />;
        },

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
  // 如果包含 wistia 短代码或标签，也不视为纯 HTML，走我们的解析流程
  if (/\[wistia|wistia-player/.test(trimmed)) return false;
  return /^<([a-z][\s\S]?)>[\s\S]*<\/\1>$/.test(trimmed) && !/[\[\]]/.test(trimmed);
}

export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;
  
  const finalHtml = processCustomTags(content);
  // 注意：processCustomTags 可能会生成 <custom-wistia>，这在 pureHtml 模式下无法被 React 组件捕获
  // 所以如果有 wistia 标签，最好强制走 MarkdownViewer
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
        
        /* 例外：引用、图片、表格、Wistia 不需要缩进 */
        [&_blockquote_p]:!indent-0
        prose-img:!indent-0
        [&_table]:!indent-0
        [&_th]:!indent-0
        [&_td]:!indent-0
        
        /* Wistia Web Component 样式修复 */
        [&_wistia-player]:!indent-0
        [&_wistia-player]:block
        
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