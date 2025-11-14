import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PasswordStrength } from '@/utils/validators';

// ==========================================
// VALIDATION ICON (Checkmark / X)
// ==========================================

interface ValidationIconProps {
  isValid: boolean;
  show: boolean;
}

export function ValidationIcon({ isValid, show }: ValidationIconProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="absolute right-6 top-1/2 -translate-y-1/2 z-20"
      style={{ marginTop: '12px' }}
    >
      {isValid ? (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20">
          <Check className="w-3.5 h-3.5 text-green-500" strokeWidth={3} />
        </div>
      ) : (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
          <X className="w-3.5 h-3.5 text-red-500" strokeWidth={3} />
        </div>
      )}
    </motion.div>
  );
}

// ==========================================
// PASSWORD STRENGTH METER
// ==========================================

interface PasswordStrengthMeterProps {
  strength: PasswordStrength | null;
  show: boolean;
}

export function PasswordStrengthMeter({ strength, show }: PasswordStrengthMeterProps) {
  if (!show || !strength) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="mt-2 space-y-2"
    >
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-300"
            style={{
              backgroundColor: strength.color,
              width: `${strength.percentage}%`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${strength.percentage}%` }}
          />
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <RequirementItem
          label="At least 8 characters"
          satisfied={strength.requirements.minLength}
        />
        <RequirementItem
          label="Contains uppercase letter"
          satisfied={strength.requirements.hasUppercase}
        />
        <RequirementItem
          label="Contains lowercase letter"
          satisfied={strength.requirements.hasLowercase}
        />
        <RequirementItem
          label="Contains number"
          satisfied={strength.requirements.hasNumber}
        />
        <RequirementItem
          label="Contains special character (@$!%*?&#)"
          satisfied={strength.requirements.hasSpecial}
        />
      </div>
    </motion.div>
  );
}

// ==========================================
// REQUIREMENT ITEM (Checklist Item)
// ==========================================

interface RequirementItemProps {
  label: string;
  satisfied: boolean;
}

function RequirementItem({ label, satisfied }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2">
      {satisfied ? (
        <Check className="w-3 h-3 text-green-500 flex-shrink-0" strokeWidth={3} />
      ) : (
        <X className="w-3 h-3 text-foreground/30 flex-shrink-0" strokeWidth={3} />
      )}
      <span
        className={`text-xs ${
          satisfied ? 'text-foreground/80' : 'text-foreground/40'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
