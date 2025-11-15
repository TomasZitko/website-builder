import React, { useState, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, User } from 'lucide-react';
import { motion, useInView, Variants, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFormValidation } from '@/hooks/useFormValidation';
import { ValidationIcon, PasswordStrengthMeter } from './validation-feedback';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface AuthDualViewProps {
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  onSignUp?: (data: { email: string; password: string; fullName: string }) => Promise<void>;
  onGoogleAuth?: () => void;
  onAppleAuth?: () => void;
  onResetPassword?: () => void;
  logo?: React.ReactNode;
  brandName?: string;
  defaultView?: 'login' | 'signup';
}

// ==========================================
// GLASS BUTTON COMPONENT
// ==========================================

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, variant: _variant = 'primary', loading, contentClassName, onClick, disabled, ...props }, ref) => {
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector("button");
      if (button && e.target !== button && !disabled) button.click();
    };

    return (
      <div
        className={cn(
          "glass-button-wrap rounded-full relative",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
        onClick={handleWrapperClick}
      >
        <button
          className={cn("glass-button relative z-10 text-base font-medium")}
          ref={ref}
          onClick={onClick}
          disabled={loading || disabled}
          {...props}
        >
          <span className={cn("glass-button-text relative block select-none tracking-tighter px-6 py-2.5", contentClassName)}>
            <span className="flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
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

// ==========================================
// GLASS INPUT COMPONENT
// ==========================================

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

function GlassInput({ label, icon, error, className, ...props }: GlassInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          {label}
        </label>
      )}
      <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
        <div className="luxury-glass-input relative z-10 flex items-center h-12 rounded-full">
          <span className="luxury-glass-input-text px-5 py-2.5 w-full flex items-center">
            {icon && (
              <div className="flex-shrink-0 flex items-center justify-center mr-3">
                {icon}
              </div>
            )}
            <input
              className={cn(
                "w-full bg-transparent text-foreground placeholder:text-foreground/50 focus:outline-none",
                className
              )}
              {...props}
            />
          </span>
        </div>
        <div className="luxury-glass-input-shadow rounded-full pointer-events-none"></div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ==========================================
// BLUR FADE ANIMATION
// ==========================================

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

// ==========================================
// GRADIENT BACKGROUND
// ==========================================

function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-slate-500/15 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gray-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[40%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

// ==========================================
// OAUTH ICONS
// ==========================================

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);


// ==========================================
// TESTIMONIAL CARD
// ==========================================

function TestimonialCard({ testimonial, delay }: { testimonial: Testimonial; delay: number }) {
  return (
    <BlurFade delay={delay} className="w-72">
      <div className="glass-testimonial-card group">
        <div className="flex items-start gap-3">
          <img
            src={testimonial.avatarSrc}
            alt={testimonial.name}
            className="h-10 w-10 rounded-xl object-cover ring-2 ring-foreground/5"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
            <p className="text-xs text-muted-foreground">{testimonial.handle}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{testimonial.text}</p>
      </div>
    </BlurFade>
  );
}

// ==========================================
// HERO SECTION (Reusable)
// ==========================================

interface HeroSectionProps {
  heroImageSrc?: string;
  testimonials: Testimonial[];
  view: 'login' | 'signup';
}

function HeroSection({ heroImageSrc, testimonials }: HeroSectionProps) {
  if (!heroImageSrc) return null;

  return (
    <div className="hidden lg:flex items-center justify-center p-12 relative">
      <BlurFade delay={0.3} className="w-full h-full">
        <div className="relative h-full rounded-3xl overflow-hidden">
          {/* Glass overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/10 to-gray-600/10 backdrop-blur-[2px] z-10"></div>
          <img
            src={heroImageSrc}
            alt="Hero"
            className="h-full w-full object-cover"
          />

          {/* Testimonials Overlay */}
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4 px-8 max-w-full overflow-x-auto">
              {testimonials.slice(0, 2).map((testimonial, idx) => (
                <TestimonialCard
                  key={idx}
                  testimonial={testimonial}
                  delay={1 + idx * 0.2}
                />
              ))}
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  );
}

// ==========================================
// FORM CONTENT (Reusable)
// ==========================================

interface FormContentProps {
  view: 'login' | 'signup';
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;
  isLoading: boolean;
  errors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  onToggleView: () => void;
  onGoogleAuth?: () => void;
  onAppleAuth?: () => void;
  onResetPassword?: () => void;
  logo?: React.ReactNode;
  brandName?: string;
}

function FormContent({
  view,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isLoading,
  errors,
  onSubmit,
  onToggleView,
  onGoogleAuth,
  onAppleAuth,
  onResetPassword,
  logo,
  brandName,
}: FormContentProps) {
  const isLogin = view === 'login';

  // Use validation hook
  const { validation, validateField, setFieldTouched, isSubmitDisabled } = useFormValidation(
    formData.email,
    formData.password,
    formData.confirmPassword,
    !isLogin
  );

  return (
    <div className="flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-md space-y-3">
        {/* Logo */}
        {logo && (
          <BlurFade delay={0}>
            <div className="flex items-center gap-3">
              {logo}
              <h1 className="text-lg font-bold text-foreground">{brandName}</h1>
            </div>
          </BlurFade>
        )}

        {/* Header */}
        <div className="space-y-1">
          <BlurFade delay={0.1}>
            <h1 className="font-serif text-4xl font-light tracking-tight text-foreground lg:text-5xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? 'Sign in to continue your journey with us'
                : 'Join us and start building amazing websites'}
            </p>
          </BlurFade>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-3">
          {/* Full Name (Sign Up Only) */}
          {!isLogin && (
            <BlurFade delay={0.3}>
              <GlassInput
                type="text"
                label="Full Name (Optional)"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                icon={<User className="h-5 w-5 text-foreground/60" />}
              />
            </BlurFade>
          )}

          {/* Email */}
          <BlurFade delay={isLogin ? 0.3 : 0.4}>
            <div className="relative">
              <GlassInput
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setFieldTouched('email');
                }}
                onBlur={() => validateField('email')}
                required
                error={validation.email.touched && validation.email.error ? validation.email.error : errors.email}
              />
              <ValidationIcon
                isValid={validation.email.isValid}
                show={validation.email.touched && formData.email.length > 0}
              />
            </div>
          </BlurFade>

          {/* Password */}
          <BlurFade delay={isLogin ? 0.4 : 0.5}>
            <div className="space-y-0">
              <div className="relative">
                <GlassInput
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setFieldTouched('password');
                  }}
                  onBlur={() => validateField('password')}
                  required
                  error={validation.password.touched && validation.password.error ? validation.password.error : errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-foreground/60 hover:text-foreground transition-colors"
                  style={{ marginTop: '10px' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Password Strength Meter (Sign Up Only) */}
              {!isLogin && (
                <PasswordStrengthMeter
                  strength={validation.password.strength}
                  show={validation.password.touched && formData.password.length > 0}
                />
              )}
            </div>
          </BlurFade>

          {/* Confirm Password (Sign Up Only) */}
          {!isLogin && (
            <BlurFade delay={0.6}>
              <div className="relative">
                <GlassInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setFieldTouched('confirmPassword');
                  }}
                  onBlur={() => validateField('confirmPassword')}
                  required
                  error={validation.confirmPassword.touched && validation.confirmPassword.error ? validation.confirmPassword.error : errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 z-20 text-foreground/60 hover:text-foreground transition-colors"
                  style={{ marginTop: '10px' }}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {/* Validation Icon for Confirm Password */}
                {validation.confirmPassword.touched && formData.confirmPassword.length > 0 && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20" style={{ marginTop: '10px' }}>
                    <ValidationIcon
                      isValid={validation.confirmPassword.isValid}
                      show={true}
                    />
                  </div>
                )}
              </div>
            </BlurFade>
          )}

          {/* Remember Me / Forgot Password (Login Only) */}
          {isLogin && (
            <BlurFade delay={0.5}>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="h-4 w-4 rounded border-foreground/20 bg-foreground/5 text-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                    Keep me signed in
                  </span>
                </label>
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </BlurFade>
          )}

          {/* Submit Button */}
          <BlurFade delay={isLogin ? 0.6 : 0.7}>
            <GlassButton
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={isLoading || (validation.email.touched && isSubmitDisabled)}
              className="w-full"
            >
              {isLoading
                ? (isLogin ? 'Signing in...' : 'Creating account...')
                : (isLogin ? 'Sign In' : 'Create Account')}
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
            </GlassButton>
          </BlurFade>
        </form>

        {/* Divider */}
        <BlurFade delay={isLogin ? 0.7 : 0.8}>
          <div className="relative flex items-center justify-center">
            <hr className="w-full border-border" />
            <span className="absolute bg-background px-3 text-xs text-muted-foreground">
              Or continue with
            </span>
          </div>
        </BlurFade>

        {/* OAuth Buttons - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <BlurFade delay={isLogin ? 0.8 : 0.9}>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={onGoogleAuth}
              className="w-full"
              contentClassName="px-4 py-3"
            >
              <GoogleIcon />
              <span className="text-sm font-medium">Continue with Google</span>
            </GlassButton>
          </BlurFade>

          <BlurFade delay={isLogin ? 0.85 : 0.95}>
            <GlassButton
              type="button"
              variant="secondary"
              onClick={onAppleAuth}
              className="w-full"
              contentClassName="px-4 py-3"
            >
              <AppleIcon />
              <span className="text-sm font-medium">Continue with Apple</span>
            </GlassButton>
          </BlurFade>
        </div>

        {/* Toggle View Link - Text Only */}
        <BlurFade delay={isLogin ? 0.95 : 1.05}>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            {' '}
            <button
              type="button"
              onClick={onToggleView}
              className="text-foreground font-medium hover:underline underline-offset-4 transition-all"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT: AUTH DUAL VIEW
// ==========================================

export function AuthDualView({
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onSignUp,
  onGoogleAuth,
  onAppleAuth,
  onResetPassword,
  logo,
  brandName = "Brand",
  defaultView = 'login',
}: AuthDualViewProps) {
  const [view, setView] = useState<'login' | 'signup'>(defaultView);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    rememberMe: false,
  });

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation (sign up only)
    if (view === 'signup') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (view === 'login' && onSignIn) {
        await onSignIn({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        });
      } else if (view === 'signup' && onSignUp) {
        await onSignUp({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Authentication failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between login and signup
  const handleToggleView = () => {
    setView(prev => prev === 'login' ? 'signup' : 'login');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Transition variants for smooth animations
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Effects */}
      <GradientBackground />

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 grid min-h-screen lg:grid-cols-2"
        >
          {/* Conditional Layout: Mirrored for signup */}
          {view === 'login' ? (
            <>
              {/* Login: Form Left, Hero Right */}
              <FormContent
                view={view}
                formData={formData}
                setFormData={setFormData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                isLoading={isLoading}
                errors={errors}
                onSubmit={handleSubmit}
                onToggleView={handleToggleView}
                onGoogleAuth={onGoogleAuth}
                onAppleAuth={onAppleAuth}
                onResetPassword={onResetPassword}
                logo={logo}
                brandName={brandName}
              />
              <HeroSection
                heroImageSrc={heroImageSrc}
                testimonials={testimonials}
                view={view}
              />
            </>
          ) : (
            <>
              {/* Signup: Hero Left, Form Right (Mirrored) */}
              <HeroSection
                heroImageSrc={heroImageSrc}
                testimonials={testimonials}
                view={view}
              />
              <FormContent
                view={view}
                formData={formData}
                setFormData={setFormData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                isLoading={isLoading}
                errors={errors}
                onSubmit={handleSubmit}
                onToggleView={handleToggleView}
                onGoogleAuth={onGoogleAuth}
                onAppleAuth={onAppleAuth}
                onResetPassword={onResetPassword}
                logo={logo}
                brandName={brandName}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
