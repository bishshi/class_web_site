"use client";

import { useState, useEffect } from "react";
import { Heart, ThumbsUp, Smile, Star } from "lucide-react";

interface ReactionButtonProps {
  articleId: string;
  className?: string;
  showAllKinds?: boolean; // 是否显示所有可用的 reaction 类型
}

interface ReactionData {
  documentId: string;
  kind?: {
    slug: string;
    name: string;
  };
}

interface ReactionKind {
  documentId: string;
  slug: string;
  name: string;
  emoji?: string;
  icon?: string;
}

// 根据 slug 返回对应的图标组件
const getIconForSlug = (slug: string) => {
  const iconMap: Record<string, typeof Heart> = {
    like: ThumbsUp,
    love: Heart,
    happy: Smile,
    star: Star,
  };
  return iconMap[slug] || Heart;
};

export default function ReactionButton({ 
  articleId, 
  className = "",
  showAllKinds = false 
}: ReactionButtonProps) {
  const [reactionKinds, setReactionKinds] = useState<ReactionKind[]>([]);
  const [reactions, setReactions] = useState<Map<string, { count: number; isActive: boolean }>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

  // 生成或获取用户 ID
  useEffect(() => {
    let id = localStorage.getItem("reaction-user-id");
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("reaction-user-id", id);
    }
    setUserId(id);
  }, []);

  // 获取可用的 reaction kinds
  useEffect(() => {
    const fetchReactionKinds = async () => {
      try {
        const response = await fetch(`${STRAPI_URL}/api/reactions/kinds`);
        if (response.ok) {
          const data = await response.json();
          setReactionKinds(data.data || []);
        }
      } catch (error) {
        console.error("获取 reaction kinds 失败:", error);
      }
    };

    fetchReactionKinds();
  }, []);

  // 获取文章的 reactions
  useEffect(() => {
    if (!userId || reactionKinds.length === 0) return;
    
    fetchReactions();
  }, [userId, articleId, reactionKinds]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(
        `${STRAPI_URL}/api/reactions/list/collection/api::article.article/${articleId}`,
        {
          headers: {
            "X-Reactions-Author": userId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allReactions = data.data || [];
        
        // 为每种 reaction kind 统计数量和用户状态
        const reactionMap = new Map();
        
        reactionKinds.forEach(kind => {
          const kindReactions = allReactions.filter(
            (r: ReactionData) => r.kind?.slug === kind.slug
          );
          
          reactionMap.set(kind.slug, {
            count: kindReactions.length,
            isActive: kindReactions.some((r: ReactionData) => r.documentId), // 用户是否已点击
          });
        });
        
        setReactions(reactionMap);
      }
    } catch (error) {
      console.error("获取 reactions 失败:", error);
    }
  };

  const toggleReaction = async (kindSlug: string) => {
    if (isLoading || !userId) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${STRAPI_URL}/api/reactions/toggle/${kindSlug}/collection/api::article.article/${articleId}`,
        {
          method: "POST",
          headers: {
            "X-Reactions-Author": userId,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // 切换成功后,更新本地状态
        setReactions(prev => {
          const newMap = new Map(prev);
          const current = newMap.get(kindSlug) || { count: 0, isActive: false };
          
          newMap.set(kindSlug, {
            count: current.isActive ? current.count - 1 : current.count + 1,
            isActive: !current.isActive,
          });
          
          return newMap;
        });
      }
    } catch (error) {
      console.error("切换 reaction 失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 如果只显示一种类型(第一种)
  if (!showAllKinds && reactionKinds.length > 0) {
    const primaryKind = reactionKinds[0];
    const reactionState = reactions.get(primaryKind.slug) || { count: 0, isActive: false };
    const Icon = getIconForSlug(primaryKind.slug);

    return (
      <button
        onClick={() => toggleReaction(primaryKind.slug)}
        disabled={isLoading}
        className={`
          group inline-flex items-center gap-2 rounded-full px-4 py-2 
          transition-all duration-200
          ${reactionState.isActive
            ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
            : "bg-slate-50 text-slate-600 hover:bg-slate-100"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
        aria-label={reactionState.isActive ? `取消${primaryKind.name}` : primaryKind.name}
      >
        <Icon 
          className={`
            h-5 w-5 transition-all duration-200
            ${reactionState.isActive ? "fill-rose-600" : "group-hover:scale-110"}
          `}
        />
        <span className="text-sm font-medium">
          {reactionState.count > 0 ? reactionState.count : ""}
          {reactionState.count === 0 && primaryKind.name}
        </span>
      </button>
    );
  }

  // 显示所有 reaction 类型
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {reactionKinds.map(kind => {
        const reactionState = reactions.get(kind.slug) || { count: 0, isActive: false };
        const Icon = getIconForSlug(kind.slug);

        return (
          <button
            key={kind.slug}
            onClick={() => toggleReaction(kind.slug)}
            disabled={isLoading}
            className={`
              group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 
              transition-all duration-200 text-sm
              ${reactionState.isActive
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
            aria-label={reactionState.isActive ? `取消${kind.name}` : kind.name}
            title={kind.name}
          >
            {kind.emoji ? (
              <span className="text-base">{kind.emoji}</span>
            ) : (
              <Icon 
                className={`
                  h-4 w-4 transition-all duration-200
                  ${reactionState.isActive ? "fill-rose-600" : "group-hover:scale-110"}
                `}
              />
            )}
            {reactionState.count > 0 && (
              <span className="font-medium">{reactionState.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}