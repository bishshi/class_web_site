"use client";

import { useState, useEffect, useRef } from "react";
import { Smile } from "lucide-react";

// --- 接口定义 ---

interface ReactionPickerProps {
  /**
   * Strapi 的 Collection Type UID
   * 例如: "api::article.article", "api::comment.comment"
   */
  collectionType: string;

  /**
   * 内容的 Database ID (必须是数字，或者数字字符串 "12")
   * 注意：不要传 Document ID ("article-xyz...")
   */
  itemId: number | string;

  className?: string;
}

interface ReactionData {
  id: number;
  documentId: string;
  kind?: {
    id: number;
    slug: string;
    name: string;
  };
  author?: string;
}

interface ReactionKind {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  emoji?: string;
  emojiFallbackUrl?: string;
}

interface ReactionCount {
  kind: ReactionKind;
  count: number;
  isActive: boolean;
}

export default function ReactionPicker({ 
  collectionType, 
  itemId, 
  className = "" 
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reactionKinds, setReactionKinds] = useState<ReactionKind[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Map<string, ReactionCount>>(new Map());
  const [userId, setUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

  // --- 1. 安全检查: 确保传入的是数字 ID ---
  useEffect(() => {
    if (itemId) {
      const isNumeric = !isNaN(Number(itemId));
      if (!isNumeric) {
        console.warn(
          `[ReactionPicker] 警告: 检测到 itemId "${itemId}" 似乎不是数字。\n` +
          `Strapi Plugin Reactions 通常需要 Database ID (如 1, 2)，而不是 Document ID。\n` +
          `请检查父组件是否传入了 article.id。`
        );
      }
    }
  }, [itemId]);

  // --- 2. 生成或获取用户唯一标识 ---
  useEffect(() => {
    let id = localStorage.getItem("reaction-user-id");
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("reaction-user-id", id);
    }
    setUserId(id);
  }, []);

  // --- 3. 点击外部关闭下拉框 ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // --- 4. 获取所有可用的 Reaction Kinds (配置) ---
  useEffect(() => {
    const fetchReactionKinds = async () => {
      try {
        const response = await fetch(`${STRAPI_URL}/api/reactions/kinds`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setReactionKinds(data);
          }
        }
      } catch (error) {
        console.error("获取 reaction kinds 失败:", error);
      }
    };

    fetchReactionKinds();
  }, [STRAPI_URL]);

  // --- 5. 获取当前内容的 Reactions 统计 ---
  useEffect(() => {
    // 只有当必要参数都存在时才请求
    if (!userId || reactionKinds.length === 0 || !itemId || !collectionType) return;
    fetchReactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, itemId, collectionType, reactionKinds]);

  const fetchReactions = async () => {
    try {
      // 动态拼接 URL: /collection/:uid/:id
      const url = `${STRAPI_URL}/api/reactions/list/collection/${collectionType}/${itemId}`;

      const response = await fetch(url, {
        headers: {
          "X-Reactions-Author": userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allReactions = Array.isArray(data) ? data : (data.data || []);
        
        // 统计每种 reaction 的数量和当前用户是否点过
        const counts = new Map<string, ReactionCount>();
        
        reactionKinds.forEach(kind => {
          const kindReactions = allReactions.filter(
            (r: ReactionData) => r.kind?.slug === kind.slug
          );
          
          const isActive = kindReactions.some(
            (r: ReactionData) => r.author === userId
          );
          
          counts.set(kind.slug, {
            kind,
            count: kindReactions.length,
            isActive,
          });
        });
        
        setReactionCounts(counts);
      }
    } catch (error) {
      if (!(error instanceof TypeError && (error as any).message?.includes('Failed to fetch'))) {
        console.error("获取 reactions 失败:", error);
      }
    }
  };

  // --- 6. 切换 (点赞/取消) ---
  const toggleReaction = async (kind: ReactionKind) => {
    if (isLoading || !userId) return;

    setIsLoading(true);
    setIsOpen(false); // 点击后立即关闭选择器

    try {
      const url = `${STRAPI_URL}/api/reactions/toggle/${kind.slug}/collection/${collectionType}/${itemId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Reactions-Author": userId,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // 请求成功，更新本地状态
        updateLocalCount(kind);
      }
    } catch (error) {
      // 网络层面的错误处理 (可选：这里可以做乐观更新的回滚，或者保持现状)
      if (error instanceof TypeError && (error as any).message?.includes('Failed to fetch')) {
        // 某些特殊网络情况下，依然尝试更新UI
        updateLocalCount(kind);
      } else {
        console.error("切换 reaction 失败:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 辅助函数：纯粹更新本地 State Map
  const updateLocalCount = (kind: ReactionKind) => {
    setReactionCounts(prev => {
      const newCounts = new Map(prev);
      const current = newCounts.get(kind.slug);
      
      if (current) {
        newCounts.set(kind.slug, {
          ...current,
          count: current.isActive ? current.count - 1 : current.count + 1,
          isActive: !current.isActive,
        });
      } else {
        // 如果是该类型第一个点赞 (边缘情况)
        newCounts.set(kind.slug, {
            kind,
            count: 1,
            isActive: true
        });
      }
      
      return newCounts;
    });
  };

  // 获取有计数的 reactions 用于展示
  const activeReactions = Array.from(reactionCounts.values()).filter(r => r.count > 0);

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`} ref={pickerRef}>
      {/* 1. 已有的 reactions 显示 (胶囊按钮) */}
      {activeReactions.map(({ kind, count, isActive }) => (
        <button
          key={kind.slug}
          onClick={() => toggleReaction(kind)}
          disabled={isLoading}
          className={`
            inline-flex items-center gap-1.5 rounded-full px-3 py-1.5
            text-sm transition-all duration-200
            ${isActive
              ? "bg-blue-100 text-blue-700 border-2 border-blue-300 hover:bg-blue-200"
              : "bg-slate-50 text-slate-600 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
            }
            ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          title={kind.name}
        >
          <span className="text-base leading-none">{kind.emoji || "👍"}</span>
          <span className="font-medium">{count}</span>
        </button>
      ))}

      {/* 2. 添加 reaction 按钮 (圆形加号/笑脸) */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            inline-flex items-center justify-center
            w-9 h-9 rounded-full
            transition-all duration-200
            ${isOpen
              ? "bg-slate-200 text-slate-700"
              : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }
            border-2 border-slate-200 hover:border-slate-300
            ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-label="添加 reaction"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* 3. Reaction 选择器弹出框 */}
        {isOpen && (
          <div 
            className="
              absolute left-0 bottom-full mb-2 
              bg-white rounded-lg shadow-lg border border-slate-200
              p-2 flex gap-1
              z-50
              animate-in fade-in zoom-in-95 duration-200
            "
            style={{ minWidth: "max-content" }}
          >
            {reactionKinds.map(kind => {
              const reactionData = reactionCounts.get(kind.slug);
              const isActive = reactionData?.isActive || false;
              
              return (
                <button
                  key={kind.slug}
                  onClick={() => toggleReaction(kind)}
                  className={`
                    relative group
                    w-10 h-10 rounded-md
                    flex items-center justify-center
                    transition-all duration-200
                    ${isActive
                      ? "bg-blue-100 scale-110"
                      : "hover:bg-slate-100 hover:scale-125"
                    }
                  `}
                  title={kind.name}
                >
                  <span className="text-2xl leading-none">
                    {kind.emoji || "👍"}
                  </span>
                  
                  {/* Tooltip */}
                  <span className="
                    absolute -top-8 left-1/2 -translate-x-1/2
                    bg-slate-800 text-white text-xs px-2 py-1 rounded
                    whitespace-nowrap
                    opacity-0 group-hover:opacity-100
                    pointer-events-none
                    transition-opacity duration-200
                  ">
                    {kind.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}