// app/news/page.tsx
import Link from "next/link";
import { fetchFromStrapi } from "@/lib/api";

export default async function NewsPage() {
  const posts = await fetchFromStrapi("posts?sort=publishedAt:desc");

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">班级大事件</h1>
      <div className="space-y-4">
        {posts.map((post: any) => (
          <Link href={`/news/${post.id}`} key={post.id} className="block">
            <div className="p-6 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{post.attributes.title}</h2>
                <span className="text-sm text-gray-400">
                  {new Date(post.attributes.publishedAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 line-clamp-2">{post.attributes.Summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}