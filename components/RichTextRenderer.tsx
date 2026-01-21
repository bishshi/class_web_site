'use client';

import { ReactNode } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface Props {
  content: string;
}

export default function RichTextRenderer({ content }: Props) {
  const components = {
    // 对齐
    center: ({ children }: { children?: ReactNode }) => (
      <div className="text-center my-6">{children}</div>
    ),
    left: ({ children }: { children?: ReactNode }) => (
      <div className="text-left my-6">{children}</div>
    ),
    right: ({ children }: { children?: ReactNode }) => (
      <div className="text-right my-6">{children}</div>
    ),

    // 信息块
    note: ({ children }: { children?: ReactNode }) => (
      <div className="my-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-blue-800">
        <div className="font-semibold mb-1">📘 提示</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    ),

    warning: ({ children }: { children?: ReactNode }) => (
      <div className="my-6 rounded-lg border-l-4 border-orange-500 bg-orange-50 px-4 py-3 text-orange-900">
        <div className="font-semibold mb-1">⚠ 注意</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    ),

    // 图片
    img: (props: any) => (
      <figure className="my-10 text-center">
        <img
          {...props}
          className="inline-block max-w-full rounded-xl shadow-lg object-contain bg-gray-100"
          style={{ maxHeight: "600px" }}
          alt={props.alt || "文章配图"}
        />
        {props.alt && (
          <figcaption className="mt-3 text-sm text-gray-500 italic">
            {props.alt}
          </figcaption>
        )}
      </figure>
    ),

    // 链接
    a: (props: any) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      />
    ),
  } as Components; // 允许自定义标签通过类型检查

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}
