/**
 * SIGNUP FORK COMPONENT
 * Beautiful dual-card selector for Personal vs Agency signup
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AccountType = 'personal' | 'agency';

interface SignupForkProps {
  onSelect: (accountType: AccountType) => void;
  className?: string;
}

export function SignupFork({ onSelect, className }: SignupForkProps) {
  const [hoveredCard, setHoveredCard] = useState<AccountType | null>(null);

  const cards = [
    {
      type: 'personal' as AccountType,
      title: 'Personal Account',
      icon: User,
      subtitle: 'For Personal Projects',
      description: 'Build and host your own websites with AI assistance',
      features: [
        'Unlimited website projects',
        'AI-powered website generation',
        'Custom domains & hosting',
        'Version history & backups'
      ],
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500',
      accentColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      type: 'agency' as AccountType,
      title: 'Agency Account',
      icon: Briefcase,
      subtitle: 'For Agencies & Teams',
      description: 'Manage multiple clients and projects in one dashboard',
      features: [
        'Unlimited clients & projects',
        'White-labeled client portals',
        'Team collaboration tools',
        'Advanced billing & reporting'
      ],
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500',
      accentColor: 'text-purple-600 dark:text-purple-400'
    }
  ];

  return (
    <div className={cn('w-full max-w-6xl mx-auto p-6', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-yellow-500 mr-2" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Account Type
          </h1>
          <Sparkles className="w-6 h-6 text-yellow-500 ml-2" />
        </div>
        <p className="text-lg text-muted-foreground">
          Select the account that best fits your needs
        </p>
      </motion.div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isHovered = hoveredCard === card.type;

          return (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredCard(card.type)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => onSelect(card.type)}
              className={cn(
                'relative group cursor-pointer',
                'rounded-2xl border-2 transition-all duration-300',
                'hover:scale-105 hover:shadow-2xl',
                isHovered
                  ? 'border-transparent shadow-2xl'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {/* Animated gradient background */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10',
                      card.gradient
                    )}
                  />
                )}
              </AnimatePresence>

              <div className="relative p-8">
                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isHovered ? 1.1 : 1,
                    rotate: isHovered ? [0, -10, 10, 0] : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'inline-flex items-center justify-center',
                    'w-16 h-16 rounded-xl mb-6',
                    card.iconBg,
                    'text-white shadow-lg'
                  )}
                >
                  <Icon className="w-8 h-8" />
                </motion.div>

                {/* Title & Subtitle */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold mb-1">{card.title}</h2>
                  <p className={cn('text-sm font-medium', card.accentColor)}>
                    {card.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6">
                  {card.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {card.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isHovered ? 1 : 0.7,
                        x: isHovered ? 0 : -10
                      }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center text-sm"
                    >
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full mr-3',
                          card.iconBg
                        )}
                      />
                      {feature}
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2',
                    'py-3 px-6 rounded-lg',
                    'bg-gradient-to-r text-white font-semibold',
                    'transition-all duration-300',
                    card.gradient,
                    'hover:shadow-lg'
                  )}
                >
                  <span>
                    {card.type === 'personal' ? 'Get Started' : 'Start Your Agency'}
                  </span>
                  <ArrowRight
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isHovered && 'translate-x-1'
                    )}
                  />
                </motion.button>
              </div>

              {/* Floating badge for Agency */}
              {card.type === 'agency' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-3 -right-3"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    POPULAR
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-muted-foreground mt-8"
      >
        You can always upgrade or change your account type later
      </motion.p>
    </div>
  );
}
