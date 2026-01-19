"use client";

import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export default function ArticleRichText({ content }: { content: BlocksContent }) {
  if (!content) return null;

  return (
    <div className="prose prose-lg prose-slate max-w-none 
      prose-headings:font-bold prose-headings:text-slate-800 
      prose-p:text-slate-600 prose-p:leading-relaxed 
      prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
      prose-img:rounded-xl prose-img:shadow-md
      prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-lg"
    >
      <BlocksRenderer
        content={content}
        blocks={{
          // 自定义图片渲染：增加图片说明 (caption) 的支持
          image: ({ image }) => (
            <figure className="my-10">
              <img
                src={image.url}
                alt={image.alternativeText || ""}
                className="w-full rounded-xl shadow-lg object-cover bg-gray-100"
                style={{ maxHeight: '600px' }} // 防止竖图太长霸屏
              />
              {image.caption && (
                <figcaption className="mt-3 text-center text-sm text-gray-500 italic">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ),
          // 自定义链接：在新标签页打开
          link: ({ children, url }) => (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-medium hover:text-blue-800 transition-colors">
              {children}
            </a>
          ),
        }}
      />
    </div>
  );
}