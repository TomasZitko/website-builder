import { HTMLAttributes, ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'blur'> {
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  opacity?: number
  hover?: boolean
  glow?: boolean
  border?: boolean
  children: ReactNode
  className?: string
}

export const GlassCard = ({
  blur = 'md',
  opacity = 0.1,
  hover = false,
  glow = false,
  border = true,
  className,
  children,
  ...props
}: GlassCardProps) => {
  const blurMap = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'relative rounded-2xl',
        blurMap[blur],
        border && 'border border-white/20 dark:border-white/10',
        glow && 'shadow-2xl shadow-primary/10',
        !glow && 'shadow-xl',
        className
      )}
      style={{
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
      {...props}
    >
      {/* Gradient overlay for depth */}
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}

// Preset variations for common use cases
export const GlassCardLight = ({ className, ...props }: GlassCardProps) => (
  <GlassCard
    blur="lg"
    opacity={0.15}
    className={cn('dark:bg-white/5', className)}
    {...props}
  />
)

export const GlassCardDark = ({ className, ...props }: GlassCardProps) => (
  <GlassCard
    blur="xl"
    opacity={0.05}
    className={cn('dark:bg-black/20', className)}
    {...props}
  />
)

export const GlassCardHero = ({ className, ...props }: GlassCardProps) => (
  <GlassCard
    blur="2xl"
    opacity={0.08}
    glow
    hover
    className={cn('dark:bg-white/5', className)}
    {...props}
  />
)
