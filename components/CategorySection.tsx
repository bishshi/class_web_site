import Link from 'next/link';

// --- 配置区域 (移出组件以提升性能) ---

// 1. 分类名称到路由 Slug 的映射
const CATEGORY_MAP: Record<string, string> = {
  "教师风采": "Teacher",
  "学生风采": "Student",
  "班级活动": "Event",
  "特别策划": "SpecialEvent",
};

// 2. 颜色主题配置
// 解决了"标签是红色但标题悬停变蓝"的不一致问题
type ThemeConfig = {
  bg: string;       // 标签/装饰条背景色
  text: string;     // 链接文字颜色
  hoverText: string;// 卡片悬停时的标题颜色 (注意使用了 group-hover/card)
};

const THEME_MAP: Record<string, ThemeConfig> = {
  blue: { 
    bg: "bg-blue-500", 
    text: "text-blue-500", 
    hoverText: "group-hover/card:text-blue-600" 
  },
  red: { 
    bg: "bg-red-500", 
    text: "text-red-500", 
    hoverText: "group-hover/card:text-red-600" 
  },
  green: { 
    bg: "bg-emerald-500", 
    text: "text-emerald-500", 
    hoverText: "group-hover/card:text-emerald-600" 
  },
  purple: { 
    bg: "bg-purple-500", 
    text: "text-purple-500", 
    hoverText: "group-hover/card:text-purple-600" 
  },
  // 默认回退样式
  default: { 
    bg: "bg-blue-500", 
    text: "text-blue-500", 
    hoverText: "group-hover/card:text-blue-600" 
  }
};

// --- 类型定义 ---

type Article = {
  id: number;
  documentId: string;
  title: string;
  date: string;
  summary: string;
  isTop?: boolean;
};

type CategoryProps = {
  title: string;
  articles: Article[];
  // 使用 theme 替代原来的 color class，传入 'blue' / 'red' 等
  theme?: "blue" | "red" | "green" | "orange" | "purple"; 
};

// --- 组件主体 ---

export default function CategorySection({ title, articles, theme = "blue" }: CategoryProps) {
  
  // 处理 Slug 和 主题
  const slug = CATEGORY_MAP[title] || title;
  const currentTheme = THEME_MAP[theme] || THEME_MAP.default;

  // 容错处理：无数据时不渲染或渲染空状态
  if (!articles || articles.length === 0) {
    return null; 
  }

  return (
    <div className="mb-12">
      {/* 头部区域 */}
      <div className="flex items-center justify-between mb-6 border-b pb-2">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-6 ${currentTheme.bg} rounded-full`}></div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <Link 
          href={`/category/${slug}`} 
          className={`text-sm text-gray-500 hover:${currentTheme.text.replace('text-', 'text-')}-600 transition-colors`}
        >
          查看更多 &rarr;
        </Link>
      </div>

      {/* 文章网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((item) => (
          <Link 
            href={`/article/${item.documentId}`} 
            key={item.id} 
            // 核心修改 1: 命名组 'group/card'，隔离父级 group 影响
            // 核心修改 2: flex flex-col 确保内容高度自适应且对齐
            className="group/card flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* 内容容器：使用 flex-grow 让内部元素可以撑开高度 */}
            <div className="p-6 flex flex-col flex-grow">
              
              {/* 标签行 */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${currentTheme.bg}`}>
                  {title}
                </span>
                {item.isTop && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                    </svg>
                    TOP
                  </span>
                )}
              </div>

              {/* 标题：只响应 group/card 的悬停，且颜色根据主题动态变化 */}
              <h3 className={`text-lg font-bold text-gray-900 mb-2 transition-colors ${currentTheme.hoverText} line-clamp-1`}>
                {item.title}
              </h3>
              
              {/* 摘要：使用 flex-grow 占据剩余空间，移除固定 h-10 */}
              <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                {item.summary}
              </p>
              
              {/* 底部信息：使用 mt-auto 强制推到底部 */}
              <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
                <span>{item.date}</span>
                <span className={`transition-colors duration-300 ${currentTheme.hoverText}`}>
                  阅读全文 &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}