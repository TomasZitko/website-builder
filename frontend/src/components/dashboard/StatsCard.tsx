/**
 * StatsCard Component
 * Glass morphism stats card with GSAP number counting animation
 * Optimized for smooth 60fps animations
 */

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: number;
  change?: string;
  icon: ReactNode;
  gradient: 'primary' | 'success' | 'warning' | 'info';
  index: number;
  prefix?: string;
  suffix?: string;
}

const gradientClasses = {
  primary: 'from-violet-500/20 to-blue-500/20 border-violet-500/30',
  success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  warning: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
  info: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
};

const iconGradients = {
  primary: 'from-violet-500 to-blue-600',
  success: 'from-green-500 to-emerald-600',
  warning: 'from-orange-500 to-yellow-600',
  info: 'from-cyan-500 to-blue-600'
};

export function StatsCard({
  title,
  value,
  change,
  icon,
  gradient,
  index,
  prefix = '',
  suffix = ''
}: StatsCardProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!numberRef.current) return;

    // GSAP number counting animation
    const ctx = gsap.context(() => {
      gsap.from(numberRef.current, {
        textContent: 0,
        duration: 2,
        delay: index * 0.1,
        ease: 'power2.out',
        snap: { textContent: 1 },
        onUpdate: function () {
          if (numberRef.current) {
            numberRef.current.textContent = Math.ceil(
              parseFloat(numberRef.current.textContent || '0')
            ).toString();
          }
        }
      });
    }, cardRef);

    return () => ctx.revert();
  }, [value, index]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      {/* Glass Card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl p-6
          bg-gradient-to-br ${gradientClasses[gradient]}
          backdrop-blur-xl border
          shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]
          transition-all duration-300 ease-out
          hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.16)]
          hover:-translate-y-1
          hover:border-opacity-50
        `}
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground/60 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {prefix}
                <span ref={numberRef}>{value}</span>
                {suffix}
              </span>
            </div>
            {change && (
              <p className="text-xs text-foreground/50 mt-2">{change}</p>
            )}
          </div>

          {/* Icon with gradient */}
          <div
            className={`
              p-3 rounded-xl
              bg-gradient-to-br ${iconGradients[gradient]}
              shadow-lg
              transition-transform duration-300
              group-hover:scale-110 group-hover:rotate-6
            `}
          >
            <div className="w-6 h-6 text-white">{icon}</div>
          </div>
        </div>

        {/* Hover shimmer effect */}
        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            transition-opacity duration-500
          "
          style={{
            transform: 'translateX(-100%)',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        />
      </div>
    </motion.div>
  );
}
