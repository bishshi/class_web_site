// types/search.ts (新建或添加到 index.ts)

export interface SearchResultItem {
  id: string;        // documentId
  title: string;     // 显示的主标题 (文章标题 或 学生姓名)
  category: string;  // 类型标识: 'article' | 'student'
  subTitle?: string; // 副标题 (可选，例如文章分类 或 学生年级)
  href: string;      // 点击跳转的路径
}

export interface SearchState {
  results: SearchResultItem[];
  isLoading: boolean;
  isOpen: boolean;
}