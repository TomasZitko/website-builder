import { motion } from 'framer-motion'
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface LiquidGradientProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'ocean' | 'sunset' | 'forest' | 'cosmic'
  animate?: boolean
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  opacity?: number
  speed?: number // Animation duration in seconds
}

const gradientVariants = {
  primary: 'from-blue-400 via-purple-500 to-pink-500',
  secondary: 'from-cyan-400 via-teal-500 to-emerald-500',
  ocean: 'from-blue-600 via-cyan-500 to-teal-400',
  sunset: 'from-orange-500 via-pink-500 to-purple-600',
  forest: 'from-green-600 via-emerald-500 to-teal-400',
  cosmic: 'from-purple-600 via-blue-500 to-cyan-400',
}

export const LiquidGradient = ({
  variant = 'primary',
  animate = true,
  blur = '3xl',
  opacity = 0.6,
  speed = 10,
  className,
  ...props
}: LiquidGradientProps) => {
  const blurClass = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
    '2xl': 'blur-2xl',
    '3xl': 'blur-3xl',
  }[blur]

  return (
    <div
      className={cn('absolute inset-0 overflow-hidden', className)}
      style={{ opacity }}
      {...props}
    >
      {animate ? (
        <motion.div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            gradientVariants[variant],
            blurClass
          )}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: speed,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
          }}
          style={{
            backgroundSize: '400% 400%',
          }}
        />
      ) : (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            gradientVariants[variant],
            blurClass
          )}
          style={{
            backgroundSize: '400% 400%',
            backgroundPosition: '50% 50%',
          }}
        />
      )}

      {/* Overlay gradient for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
    </div>
  )
}

// Animated blob variant
export const LiquidBlob = ({
  variant = 'primary',
  className,
  size = 'md',
}: {
  variant?: 'primary' | 'secondary' | 'ocean' | 'sunset' | 'forest' | 'cosmic'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) => {
  const sizeMap = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-96 h-96',
  }

  return (
    <motion.div
      className={cn(
        'absolute rounded-full',
        'bg-gradient-to-br',
        gradientVariants[variant],
        'blur-3xl',
        sizeMap[size],
        className
      )}
      animate={{
        x: [0, 30, 0, -30, 0],
        y: [0, -30, 0, 30, 0],
        scale: [1, 1.1, 0.9, 1.1, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    />
  )
}

// Multiple floating blobs for complex backgrounds
export const LiquidBlobs = ({ className }: { className?: string }) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <LiquidBlob variant="primary" size="lg" className="top-10 left-10 opacity-30" />
      <LiquidBlob variant="secondary" size="md" className="top-1/3 right-20 opacity-25" />
      <LiquidBlob variant="ocean" size="xl" className="bottom-20 left-1/4 opacity-20" />
      <LiquidBlob variant="sunset" size="md" className="bottom-1/3 right-1/3 opacity-30" />
    </div>
  )
}
