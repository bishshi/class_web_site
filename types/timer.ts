// types.ts (或你存放类型的地方)

export interface Timer {
  documentId: string;
  title: string;
  targetTime: string; // ISO 8601 String
  isActive: boolean;
}