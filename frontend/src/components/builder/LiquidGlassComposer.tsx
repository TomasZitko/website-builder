import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { ArrowRight, Paperclip, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComposerPrimitive, ThreadPrimitive } from '@assistant-ui/react';
import { Button } from '@/components/ui/button';
import {
  Code2,
  Palette,
  Layers,
  Rocket,
  MonitorIcon,
  ShoppingBag,
  Briefcase,
  Camera,
} from 'lucide-react';

// --- LUXURY GLASS BUTTON COMPONENT ---
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, variant = 'primary', loading, contentClassName, onClick, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // Prevent duplicate clicks - only trigger if clicking the wrapper, not the button
      if (e.target === e.currentTarget) {
        const button = e.currentTarget.querySelector("button");
        if (button) {
          e.preventDefault();
          e.stopPropagation();
          button.click();
        }
      }
    };

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent event bubbling to wrapper
      e.stopPropagation();
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <div
        className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)}
        onClick={handleWrapperClick}
      >
        <button
          className={cn("glass-button relative z-10 text-base font-medium")}
          ref={ref}
          onClick={handleButtonClick}
          disabled={loading}
          {...props}
        >
          <span className={cn("glass-button-text relative block select-none tracking-tighter px-6 py-3.5", contentClassName)}>
            <span className="flex items-center justify-center gap-2">
              {children}
            </span>
          </span>
        </button>
        <div className="glass-button-shadow rounded-full pointer-events-none"></div>
      </div>
    );
  },
);
GlassButton.displayName = "GlassButton";

// --- BLUR FADE ANIMATION ---
interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

function BlurFade({ children, className, delay = 0, duration = 0.4 }: BlurFadeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variants: Variants = {
    hidden: { y: 6, opacity: 0, filter: 'blur(6px)' },
    visible: { y: 0, opacity: 1, filter: 'blur(0px)' },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Export OceanicBackground (imported from separate file)
export { OceanicBackground } from './OceanicBackground';

// --- LIQUID GLASS COMPOSER ---
export function LiquidGlassComposer() {
  return (
    <div className="aui-composer-wrapper mx-auto flex w-full max-w-[var(--thread-max-width)] flex-col gap-3 overflow-visible pb-2">
      {/* Liquid Glass Input Box */}
      <BlurFade delay={0}>
        <ComposerPrimitive.Root className="relative">
          <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
            <div className="luxury-glass-input relative z-10 flex items-center min-h-[56px] rounded-full">
              <span className="luxury-glass-input-text px-5 py-3 w-full flex items-center">
                <ComposerPrimitive.Input
                  placeholder="Describe the website you want to build..."
                  className="w-full bg-transparent text-foreground placeholder:text-foreground/50 focus:outline-none resize-none max-h-32"
                  rows={1}
                  autoFocus
                  aria-label="Message input"
                />
              </span>
            </div>
            <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
          </div>

          {/* Action Buttons */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 z-20">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
            >
              <Paperclip className="w-4 h-4 text-foreground/60" />
            </button>

            <ThreadPrimitive.If running={false}>
              <ComposerPrimitive.Send asChild>
                <GlassButton type="submit" contentClassName="px-4 py-2">
                  Send
                  <ArrowRight className="w-4 h-4 ml-1" />
                </GlassButton>
              </ComposerPrimitive.Send>
            </ThreadPrimitive.If>

            <ThreadPrimitive.If running>
              <ComposerPrimitive.Cancel asChild>
                <GlassButton type="button" contentClassName="px-4 py-2">
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span className="ml-1">Stop</span>
                </GlassButton>
              </ComposerPrimitive.Cancel>
            </ThreadPrimitive.If>
          </div>
        </ComposerPrimitive.Root>
      </BlurFade>

      {/* Quick Action Pills */}
      <ThreadPrimitive.If empty>
        <QuickActionPills />
      </ThreadPrimitive.If>
    </div>
  );
}

// --- QUICK ACTION PILLS ---
function QuickActionPills() {
  const quickActions = [
    { icon: <MonitorIcon className="w-4 h-4" />, label: "Landing Page", prompt: "Build me a modern landing page with hero section, features, and CTA" },
    { icon: <ShoppingBag className="w-4 h-4" />, label: "E-commerce", prompt: "Create an e-commerce website with product catalog and shopping cart" },
    { icon: <Briefcase className="w-4 h-4" />, label: "Portfolio", prompt: "Design a professional portfolio website for a freelancer" },
    { icon: <Camera className="w-4 h-4" />, label: "Photography", prompt: "Build a photography portfolio with elegant gallery layout" },
    { icon: <Rocket className="w-4 h-4" />, label: "Startup", prompt: "Create a SaaS startup landing page with pricing tiers" },
  ];

  return (
    <BlurFade delay={0.2} className="flex items-center justify-center flex-wrap gap-2">
      {quickActions.map((action, index) => (
        <ThreadPrimitive.Suggestion key={index} prompt={action.prompt} send asChild>
          <button className="glass-button-wrap rounded-full">
            <div className="glass-button px-3 py-1.5 text-sm font-medium flex items-center gap-1.5">
              <span className="glass-button-text flex items-center gap-1.5">
                {action.icon}
                {action.label}
              </span>
            </div>
            <div className="glass-button-shadow rounded-full"></div>
          </button>
        </ThreadPrimitive.Suggestion>
      ))}
    </BlurFade>
  );
}
