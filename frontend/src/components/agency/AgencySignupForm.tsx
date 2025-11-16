/**
 * AGENCY SIGNUP FORM
 * Extended signup form for agency accounts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authApi } from '@/api/auth';

interface AgencySignupFormProps {
  onBack: () => void;
  onSuccess: (data: any) => void;
  className?: string;
}

export function AgencySignupForm({ onBack, onSuccess, className }: AgencySignupFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    agencyName: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authApi.register({
        ...formData,
        accountType: 'agency'
      });

      onSuccess(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border shadow-xl p-8"
      >
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to selection
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Create Agency Account</h2>
              <p className="text-sm text-muted-foreground">
                Manage clients and projects
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agency Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Agency Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                placeholder="e.g., Bob's Web Design"
                required
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg',
                  'border border-input bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
                  'transition-all'
                )}
              />
            </div>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-lg',
                    'border border-input bg-background',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
                    'transition-all'
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg',
                  'border border-input bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
                  'transition-all'
                )}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@agency.com"
                required
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg',
                  'border border-input bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
                  'transition-all'
                )}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                className={cn(
                  'w-full pl-10 pr-12 py-2.5 rounded-lg',
                  'border border-input bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
                  'transition-all'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Min. 8 characters with uppercase, lowercase, number & special character
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-semibold',
              'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
              'hover:shadow-lg transition-all',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating your agency...
              </>
            ) : (
              <>
                Create Agency Account
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our{' '}
          <a href="/terms" className="text-purple-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-purple-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
