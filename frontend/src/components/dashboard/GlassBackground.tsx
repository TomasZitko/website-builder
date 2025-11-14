/**
 * GlassBackground Component
 * Animated gradient orbs background with subtle grid pattern
 * Optimized for 60fps performance
 */

export function GlassBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-[120px] animate-pulse-slow"
        style={{ animationDelay: '0s', animationDuration: '8s' }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse-slow"
        style={{ animationDelay: '2s', animationDuration: '10s' }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/25 rounded-full blur-[120px] animate-pulse-slow"
        style={{ animationDelay: '4s', animationDuration: '12s' }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50" />
    </div>
  );
}
