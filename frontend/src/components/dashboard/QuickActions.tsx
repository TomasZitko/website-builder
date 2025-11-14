/**
 * QuickActions Component
 * Grid of quick action buttons with glassmorphism design
 * Provides shortcuts to common tasks
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  IconPlus,
  IconTemplate,
  IconSettings,
  IconCreditCard,
  IconCloud,
  IconDownload
} from '@tabler/icons-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onClick: () => void;
}

export function QuickActions() {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'new-website',
      title: 'New Website',
      description: 'Start building with AI',
      icon: <IconPlus className="w-6 h-6" />,
      gradient: 'from-violet-500 to-blue-600',
      onClick: () => navigate('/builder')
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Browse pre-made designs',
      icon: <IconTemplate className="w-6 h-6" />,
      gradient: 'from-blue-500 to-cyan-600',
      onClick: () => navigate('/templates')
    },
    {
      id: 'hosting',
      title: 'Hosting',
      description: 'Manage your domains',
      icon: <IconCloud className="w-6 h-6" />,
      gradient: 'from-green-500 to-emerald-600',
      onClick: () => navigate('/builder') // TODO: Add hosting page
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'View payments & invoices',
      icon: <IconCreditCard className="w-6 h-6" />,
      gradient: 'from-orange-500 to-yellow-600',
      onClick: () => navigate('/settings')
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Account preferences',
      icon: <IconSettings className="w-6 h-6" />,
      gradient: 'from-purple-500 to-pink-600',
      onClick: () => navigate('/settings')
    },
    {
      id: 'downloads',
      title: 'Downloads',
      description: 'Export your websites',
      icon: <IconDownload className="w-6 h-6" />,
      gradient: 'from-indigo-500 to-purple-600',
      onClick: () => {} // TODO: Add downloads functionality
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {actions.map((action, idx) => (
        <motion.button
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05, duration: 0.3 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          className="
            group relative overflow-hidden
            p-6 rounded-2xl text-left
            bg-gradient-to-br from-background/60 to-background/40
            backdrop-blur-xl border border-foreground/[0.08]
            shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]
            hover:shadow-[0_12px_48px_0_rgba(0,0,0,0.16)]
            hover:border-foreground/[0.12]
            transition-all duration-300
          "
        >
          {/* Top highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Icon with gradient background */}
          <div className="flex items-start gap-4 mb-3">
            <div
              className={`
                p-3 rounded-xl
                bg-gradient-to-br ${action.gradient}
                shadow-lg
                transition-transform duration-300
                group-hover:scale-110 group-hover:rotate-3
              `}
            >
              <div className="text-white">{action.icon}</div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {action.title}
            </h3>
            <p className="text-sm text-foreground/60">
              {action.description}
            </p>
          </div>

          {/* Hover shimmer effect */}
          <div
            className="
              absolute inset-0 opacity-0 group-hover:opacity-100
              bg-gradient-to-r from-transparent via-white/5 to-transparent
              transition-opacity duration-500 pointer-events-none
            "
            style={{
              transform: 'translateX(-100%)',
              animation: 'shimmer 3s ease-in-out infinite'
            }}
          />

          {/* Arrow indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg
              className="w-5 h-5 text-foreground/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
