import Link from 'next/link';

// 1. 修改：添加 documentId 字段
type Article = {
  id: number;          // 数据库 ID，依然用于列表渲染的 key
  documentId: string;  // Strapi v5 的唯一标识，用于跳转 URL
  title: string;
  date: string;
  summary: string;
};

type CategoryProps = {
  title: string;
  articles: Article[];
  color?: string; // 装饰色
};

export default function CategorySection({ title, articles, color = "bg-blue-500" }: CategoryProps) {

  // 分类名映射为路由 slug
  const categoryMap: Record<string, string> = {
    "教师风采": "Teacher",
    "学生风采": "Student",
    "班级活动": "Event",
    "特别策划": "SpecialEvent",
  };

  const slug = categoryMap[title] || title;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-6 ${color} rounded-full`}></div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        {/* 使用映射后的 slug 作为分类路由 */}
        <Link href={`/category/${slug}`} className="text-sm text-gray-500 hover:text-blue-600">
          查看更多 &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((item) => (
          // 2. href 使用 documentId 跳转
          // 3. key 依然使用 item.id
          <Link 
            href={`/article/${item.documentId}`} 
            key={item.id} 
            className="group block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-3 ${color}`}>
                {title}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
                {item.summary}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.date}</span>
                <span>阅读全文 &rarr;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
