// types/student.ts (建议新建文件) or 在页面中定义
import type { BlocksContent } from '@strapi/blocks-react-renderer';

export interface Student {
  id: number;
  documentId: string;
  Name: string;
  Photo: string;        // 文本字段存 URL
  Sex: string;
  location: string;     // 对应您的 location
  Birthday: string;     // YYYY-MM-DD
  Phone: string;  // Strapi 通常将 "Phone Number" 转换为 phoneNumber
  Email: string;
  Introduction: BlocksContent; // 富文本
}