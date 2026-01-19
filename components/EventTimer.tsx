"use client";

import { useEffect, useState } from "react";

interface EventTimerProps {
  title: string;
  targetTime: string;
  isSpecial?: boolean; // 新增：是否为特殊事件（变红）
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export default function EventTimer({ title, targetTime, isSpecial = false }: EventTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const targetDate = new Date(targetTime).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      const isPast = difference < 0;
      const absDiff = Math.abs(difference);

      setTimeLeft({
        days: Math.floor(absDiff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((absDiff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((absDiff / 1000 / 60) % 60),
        seconds: Math.floor((absDiff / 1000) % 60),
        isPast,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  if (!timeLeft) return null;

  // --- 样式配置 ---
  // 根据 isSpecial 切换两套皮肤
  const styles = isSpecial
    ? {
        // 特殊模式 (红色)
        container: "bg-gradient-to-br from-red-600 to-red-700 text-white border-transparent shadow-lg shadow-red-200",
        label: "text-red-100", // 顶部 Time Until 颜色
        title: "text-white",   // 标题颜色
        box: "bg-white/20 backdrop-blur-sm text-white", // 数字背景 (半透明白)
        subLabel: "text-red-100", // 数字下的文字 (天/时...)
        icon: "👻", // 特殊图标 (可选)
      }
    : {
        // 普通模式 (白色)
        container: "bg-white text-gray-800 border-gray-100 shadow-sm",
        label: "text-gray-500",
        title: "text-blue-600",
        box: "bg-gray-50 text-gray-900",
        subLabel: "text-gray-400",
        icon: "⏳",
      };

  return (
    <div className={`rounded-xl p-6 border sticky top-4 transition-all duration-300 ${styles.container}`}>
      {/* 顶部标签 */}
      <div className="flex items-center space-x-2 mb-3 opacity-90">
        <span className="text-xl">{styles.icon}</span>
        <h3 className={`font-bold text-sm uppercase tracking-wider ${styles.label}`}>
          {timeLeft.isPast ? "Time Since" : "Coming Soon"}
        </h3>
      </div>
      
      {/* 标题 - 增加字号和行高确保显示 */}
      <div className="mb-6">
        <h4 className={`text-2xl font-bold leading-tight ${styles.title}`}>
          {title || "未命名事件"} 
        </h4>
      </div>

      {/* 倒计时数字网格 */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <TimeBox val={timeLeft.days} label="DAYS" styleClass={styles.box} labelClass={styles.subLabel} />
        <TimeBox val={timeLeft.hours} label="HRS" styleClass={styles.box} labelClass={styles.subLabel} />
        <TimeBox val={timeLeft.minutes} label="MIN" styleClass={styles.box} labelClass={styles.subLabel} />
        <TimeBox val={timeLeft.seconds} label="SEC" styleClass={styles.box} labelClass={styles.subLabel} />
      </div>
    </div>
  );
}

// 子组件：数字块
function TimeBox({ 
  val, 
  label, 
  styleClass, 
  labelClass 
}: { 
  val: number; 
  label: string; 
  styleClass: string; 
  labelClass: string;
}) {
  return (
    <div className={`rounded-lg p-2 flex flex-col items-center justify-center aspect-square ${styleClass}`}>
      <span className="text-xl lg:text-2xl font-bold tabular-nums leading-none">
        {val.toString().padStart(2, '0')}
      </span>
      <span className={`text-[10px] font-bold mt-1 uppercase transform scale-90 ${labelClass}`}>
        {label}
      </span>
    </div>
  );
}