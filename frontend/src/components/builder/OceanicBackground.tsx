export function OceanicBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Pure white/gray gradient - NO COLOR, just subtle shading */}
      <div
        className="absolute inset-0 oceanic-gradient"
        style={{
          background: `
            linear-gradient(
              180deg,
              hsl(0, 0%, 100%) 0%,
              hsl(0, 0%, 98%) 20%,
              hsl(0, 0%, 96%) 40%,
              hsl(0, 0%, 94%) 60%,
              hsl(0, 0%, 92%) 80%,
              hsl(0, 0%, 90%) 100%
            )
          `,
          animation: 'oceanic-breathe 8s ease-in-out infinite',
        }}
      />

      {/* Vertical Line Texture Overlay (Ribbed/Striped) */}
      <svg className="absolute inset-0 w-full h-full vertical-lines-overlay">
        <defs>
          <pattern id="vertical-lines" width="4" height="100%" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="100%" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="0.5" />
            <line x1="2" y1="0" x2="2" y2="100%" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#vertical-lines)" />
      </svg>

      {/* Noise Grain Texture */}
      <svg className="absolute inset-0 w-full h-full noise-grain-overlay">
        <defs>
          <filter id="noise-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 0.03"/>
            </feComponentTransfer>
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#noise-grain)" opacity="0.04" />
      </svg>

      {/* Additional subtle overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.05) 100%)',
        }}
      />
    </div>
  );
}
