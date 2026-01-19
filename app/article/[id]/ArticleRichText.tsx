"use client";

import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

export default function ArticleRichText({ content }: { content: BlocksContent }) {
  if (!content) return null;

  return (
    <BlocksRenderer
      content={content}
      blocks={{
        // 这里的函数是在客户端组件内部定义的，完全合法
        image: ({ image }) => (
          <div className="my-8">
            <img
              src={image.url}
              alt={image.alternativeText || ""}
              className="rounded-lg shadow-md mx-auto"
            />
          </div>
        ),
      }}
    />
  );
}