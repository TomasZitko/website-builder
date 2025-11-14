import React, { useState, useRef } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { motion, useInView, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- LUXURY GLASS BUTTON COMPONENT ---
interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, variant = 'primary', loading, contentClassName, onClick, ...props }, ref) => {
    // This wrapper fixes a click bug
    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const button = e.currentTarget.querySelector("button");
      if (button && e.target !== button) button.click();
    };

    return (
      <div
        className={cn("glass-button-wrap cursor-pointer rounded-full relative", className)}
        onClick={handleWrapperClick}
      >
        <button
          className={cn("glass-button relative z-10 text-base font-medium")}
          ref={ref}
          onClick={onClick}
          disabled={loading}
          {...props}
        >
          <span className={cn("glass-button-text relative block select-none tracking-tighter px-6 py-3.5", contentClassName)}>
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

// --- LUXURY GLASS INPUT COMPONENT ---
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

function GlassInput({ label, icon, error, className, ...props }: GlassInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          {label}
        </label>
      )}
      <div className="luxury-glass-input-wrap cursor-text rounded-full relative">
        <div className="luxury-glass-input relative z-10 flex items-center h-14 rounded-full">
          <span className="luxury-glass-input-text px-6 py-3.5 w-full flex items-center">
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
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

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

// --- GRADIENT BACKGROUND ---
function GradientBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-slate-500/15 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-gray-600/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[40%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-500/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
    </div>
  );
}

// --- TESTIMONIAL CARD ---
export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

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

// --- GOOGLE ICON ---
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// --- MAIN SIGN-IN COMPONENT ---
interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  logo?: React.ReactNode;
  brandName?: string;
}

export function SignInPageGlass({
  title = "Welcome Back",
  description = "Sign in to continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  logo,
  brandName = "Brand",
}: SignInPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSignIn) return;

    setIsLoading(true);
    try {
      await onSignIn(formData);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Background Effects */}
      <GradientBackground />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left Column - Sign In Form */}
        <div className="flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
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
            <div className="space-y-3">
              <BlurFade delay={0.1}>
                <h1 className="font-serif text-5xl font-light tracking-tight text-foreground lg:text-6xl">
                  {title}
                </h1>
              </BlurFade>
              <BlurFade delay={0.2}>
                <p className="text-base text-muted-foreground">
                  {description}
                </p>
              </BlurFade>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <BlurFade delay={0.3}>
                <GlassInput
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </BlurFade>

              <BlurFade delay={0.4}>
                <div className="relative">
                  <GlassInput
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-[42px] z-20 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </BlurFade>

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

              <BlurFade delay={0.6}>
                <GlassButton
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
                </GlassButton>
              </BlurFade>
            </form>

            {/* Divider */}
            <BlurFade delay={0.7}>
              <div className="relative flex items-center justify-center">
                <hr className="w-full border-border" />
                <span className="absolute bg-background px-4 text-sm text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </BlurFade>

            {/* Social Login */}
            <BlurFade delay={0.8}>
              <GlassButton
                type="button"
                variant="secondary"
                onClick={onGoogleSignIn}
                className="w-full"
              >
                <GoogleIcon />
                <span className="font-semibold">Continue with Google</span>
              </GlassButton>
            </BlurFade>

            {/* Sign Up Link */}
            <BlurFade delay={0.9}>
              <p className="text-center text-sm text-muted-foreground">
                New to our platform?{' '}
                <button
                  type="button"
                  onClick={onCreateAccount}
                  className="text-foreground/80 hover:text-foreground transition-colors font-medium"
                >
                  Create an account
                </button>
              </p>
            </BlurFade>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        {heroImageSrc && (
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
        )}
      </div>
    </div>
  );
}
