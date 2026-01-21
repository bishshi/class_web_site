'use client';

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

// 1. 扩展 react-markdown 的标签类型
declare module "react-markdown" {
  interface Components {
    note?: React.FC<any>;
    warning?: React.FC<any>;
    center?: React.FC<any>;
    left?: React.FC<any>;
    right?: React.FC<any>;
  }
}

// 2. 放行自定义标签（防止被 sanitize 干掉）
const schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    "note",
    "warning",
    "center",
    "left",
    "right",
  ],
};

interface Props {
  content: string;
}

export default function ArticleRichText({ content }: Props) {
  if (!content) return null;

  const components: Components = {
    center: ({ children }) => (
      <div className="text-center my-6">{children}</div>
    ),
    left: ({ children }) => (
      <div className="text-left my-6">{children}</div>
    ),
    right: ({ children }) => (
      <div className="text-right my-6">{children}</div>
    ),

    note: ({ children }) => (
      <div className="my-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 px-4 py-3 text-blue-800">
        <div className="font-semibold mb-1">📘 提示</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    ),

    warning: ({ children }) => (
      <div className="my-6 rounded-lg border-l-4 border-orange-500 bg-orange-50 px-4 py-3 text-orange-900">
        <div className="font-semibold mb-1">⚠ 注意</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    ),

    img: (props) => (
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

    a: (props) => (
      <a
        {...props}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors"
      />
    ),
  };

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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeRaw], [rehypeSanitize, schema]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
