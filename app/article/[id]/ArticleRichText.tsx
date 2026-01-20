"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// --- 1. HTML 渲染 ---
const HtmlViewer = ({ content }: { content: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

// --- 2. Markdown 渲染（支持内嵌 HTML）---
const MarkdownViewer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        img: ({ ...props }) => (
          <figure className="my-10">
            <img
              {...props}
              className="w-full rounded-xl shadow-lg object-cover bg-gray-100"
              style={{ maxHeight: "600px" }}
              alt={props.alt || "文章配图"}
            />
            {props.alt && (
              <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// --- 3. 更可靠的 HTML 判断 ---
function isPureHtml(text: string) {
  const trimmed = text.trim();

  const htmlDocLike =
    /^<!doctype html>/i.test(trimmed) ||
    /^<html[\s>]/i.test(trimmed) ||
    /^<body[\s>]/i.test(trimmed);

  const looksLikeHtmlOnly =
    /^<([a-z][\s\S]*?)>[\s\S]*<\/\1>$/.test(trimmed) &&
    !/[#*_`\-\[\]]/.test(trimmed); // 排除 markdown 语法符号

  return htmlDocLike || looksLikeHtmlOnly;
}

// --- 4. 主组件 ---
export default function ArticleRichText({ content }: { content: string }) {
  if (!content) return null;

  const pureHtml = isPureHtml(content);

  return (
    <div
      className="
        prose prose-lg prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-slate-800
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500
        prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4
        prose-blockquote:not-italic prose-blockquote:rounded-r-lg

        [&_p]:indent-8
        [&_blockquote_p]:indent-0
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
