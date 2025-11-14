import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Theme } from '@/data/themes';
import { cn } from '@/lib/utils';

interface ThemeCardProps {
  theme: Theme;
  isSelected?: boolean;
  onSelect: (themeId: string) => void;
}

export function ThemeCard({ theme, isSelected, onSelect }: ThemeCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(theme.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative group w-full rounded-xl overflow-hidden border-2 transition-all duration-300",
        isSelected
          ? "border-violet-500 shadow-lg shadow-violet-500/20"
          : "border-transparent hover:border-violet-300 shadow-md"
      )}
    >
      {/* Preview Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={theme.preview}
          alt={theme.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Selected Checkmark */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center shadow-lg"
          >
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Theme Info */}
      <div className="p-4 bg-white group-hover:bg-gray-50 transition-colors">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 text-left">
          {theme.name}
        </h3>
        <p className="text-xs text-gray-600 text-left line-clamp-2">
          {theme.description}
        </p>

        {/* Color Palette Preview */}
        <div className="flex items-center gap-1.5 mt-3">
          <div
            className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
            style={{ backgroundColor: theme.colors.primary }}
            title="Primary"
          />
          <div
            className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
            style={{ backgroundColor: theme.colors.secondary }}
            title="Secondary"
          />
          <div
            className="w-5 h-5 rounded-full border border-gray-200 shadow-sm"
            style={{ backgroundColor: theme.colors.accent }}
            title="Accent"
          />
        </div>
      </div>

      {/* Selected Border Glow */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-xl border-2 border-violet-500 pointer-events-none"
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        />
      )}
    </motion.button>
  );
}
