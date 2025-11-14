export interface Theme {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  style: {
    borderRadius: string;
    shadows: string;
    spacing: string;
  };
  cssGuidelines: string;
}

export const themes: Theme[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean lines, lots of white space, contemporary feel',
    category: 'professional',
    colors: {
      primary: '#000000',
      secondary: '#FFFFFF',
      accent: '#3B82F6',
      background: '#F9FAFB',
      text: '#1F2937',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
    style: {
      borderRadius: 'minimal (0-4px)',
      shadows: 'subtle',
      spacing: 'generous',
    },
    cssGuidelines: `
      - Use clean, sans-serif fonts (Inter, Helvetica)
      - Generous white space (padding: 4rem 2rem)
      - Minimal border radius (0-4px)
      - Subtle shadows (box-shadow: 0 1px 3px rgba(0,0,0,0.1))
      - Simple color palette: blacks, whites, single accent color
      - Crisp lines and clear hierarchy
    `
  },
  {
    id: 'luxury-elegant',
    name: 'Luxury Elegant',
    description: 'Sophisticated, premium, refined aesthetics',
    category: 'premium',
    colors: {
      primary: '#1A1A1A',
      secondary: '#D4AF37',
      accent: '#8B7355',
      background: '#FAFAF9',
      text: '#2C2C2C',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Montserrat, sans-serif',
    },
    style: {
      borderRadius: 'none or subtle (0-2px)',
      shadows: 'elegant and soft',
      spacing: 'balanced',
    },
    cssGuidelines: `
      - Serif fonts for headings (Playfair Display, Cormorant)
      - Gold/bronze accent colors (#D4AF37, #8B7355)
      - Elegant typography with letter-spacing
      - Soft, sophisticated shadows
      - High-quality imagery
      - Refined, balanced spacing
    `
  },
  {
    id: 'warm-cozy',
    name: 'Warm & Cozy',
    description: 'Inviting, comfortable, friendly atmosphere',
    category: 'friendly',
    colors: {
      primary: '#8B4513',
      secondary: '#F4A460',
      accent: '#FF6B35',
      background: '#FFF8E7',
      text: '#4A3728',
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Open Sans, sans-serif',
    },
    style: {
      borderRadius: 'rounded (8-16px)',
      shadows: 'soft and warm',
      spacing: 'cozy',
    },
    cssGuidelines: `
      - Warm earth tones (browns, oranges, creams)
      - Rounded corners (8-16px border radius)
      - Soft, warm shadows with brown/orange tints
      - Friendly, approachable fonts (Poppins, Nunito)
      - Comfortable padding and spacing
      - Inviting imagery with warm lighting
    `
  },
  {
    id: 'bold-vibrant',
    name: 'Bold & Vibrant',
    description: 'Energetic, colorful, eye-catching design',
    category: 'creative',
    colors: {
      primary: '#E91E63',
      secondary: '#9C27B0',
      accent: '#FF9800',
      background: '#FFFFFF',
      text: '#212121',
    },
    fonts: {
      heading: 'Nunito, sans-serif',
      body: 'Roboto, sans-serif',
    },
    style: {
      borderRadius: 'bold (12-24px)',
      shadows: 'strong and colorful',
      spacing: 'dynamic',
    },
    cssGuidelines: `
      - Vibrant color palette (pinks, purples, oranges)
      - Strong, colorful shadows with color tints
      - Bold typography with thick font weights
      - Large border radius (12-24px)
      - High contrast elements
      - Energetic, dynamic layouts
    `
  },
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description: 'Earthy tones, natural elements, eco-friendly',
    category: 'eco',
    colors: {
      primary: '#2D5016',
      secondary: '#6B8E23',
      accent: '#8FBC8F',
      background: '#F5F5DC',
      text: '#3E2723',
    },
    fonts: {
      heading: 'Merriweather, serif',
      body: 'Lato, sans-serif',
    },
    style: {
      borderRadius: 'organic (6-12px)',
      shadows: 'natural and soft',
      spacing: 'balanced',
    },
    cssGuidelines: `
      - Earth tones (greens, browns, beiges)
      - Natural, organic shapes (6-12px border radius)
      - Soft, natural shadows
      - Nature-inspired imagery (leaves, wood, plants)
      - Relaxed, balanced spacing
      - Eco-friendly aesthetic
    `
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'Cutting-edge, innovative, modern technology',
    category: 'tech',
    colors: {
      primary: '#0A0E27',
      secondary: '#00D9FF',
      accent: '#7B2CBF',
      background: '#0F0F23',
      text: '#E0E0E0',
    },
    fonts: {
      heading: 'Orbitron, sans-serif',
      body: 'Rajdhani, sans-serif',
    },
    style: {
      borderRadius: 'sharp or geometric (0px or unique shapes)',
      shadows: 'neon and glowing',
      spacing: 'precise',
    },
    cssGuidelines: `
      - Dark backgrounds with neon accents
      - Glowing shadows (box-shadow: 0 0 20px cyan/purple)
      - Sharp, geometric shapes
      - Tech-inspired fonts (Orbitron, Rajdhani)
      - Precise, grid-based layouts
      - Futuristic, high-tech aesthetic
    `
  },
  {
    id: 'classic-timeless',
    name: 'Classic Timeless',
    description: 'Traditional, elegant, never goes out of style',
    category: 'traditional',
    colors: {
      primary: '#2C3E50',
      secondary: '#ECF0F1',
      accent: '#C0392B',
      background: '#FFFFFF',
      text: '#34495E',
    },
    fonts: {
      heading: 'Georgia, serif',
      body: 'Times New Roman, serif',
    },
    style: {
      borderRadius: 'classic (4-8px)',
      shadows: 'traditional and subtle',
      spacing: 'structured',
    },
    cssGuidelines: `
      - Classic serif fonts (Georgia, Times New Roman)
      - Traditional color palette (navy, burgundy, cream)
      - Subtle shadows and borders
      - Structured, formal layouts
      - Timeless design principles
      - Professional, trustworthy aesthetic
    `
  },
  {
    id: 'playful-creative',
    name: 'Playful Creative',
    description: 'Fun, unique, artistic expression',
    category: 'creative',
    colors: {
      primary: '#FFD166',
      secondary: '#06FFA5',
      accent: '#EF476F',
      background: '#F7F7FF',
      text: '#073B4C',
    },
    fonts: {
      heading: 'Fredoka One, cursive',
      body: 'Quicksand, sans-serif',
    },
    style: {
      borderRadius: 'playful (16-32px)',
      shadows: 'fun and colorful',
      spacing: 'creative',
    },
    cssGuidelines: `
      - Fun, playful fonts (Fredoka One, Comic Neue)
      - Bright, unexpected color combinations
      - Large, playful border radius (16-32px)
      - Colorful, fun shadows
      - Creative, unconventional layouts
      - Whimsical, artistic aesthetic
    `
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    description: 'Business-focused, trustworthy, authoritative',
    category: 'corporate',
    colors: {
      primary: '#003366',
      secondary: '#0066CC',
      accent: '#669900',
      background: '#F4F4F4',
      text: '#333333',
    },
    fonts: {
      heading: 'Arial, sans-serif',
      body: 'Helvetica, sans-serif',
    },
    style: {
      borderRadius: 'conservative (2-6px)',
      shadows: 'professional and clean',
      spacing: 'structured',
    },
    cssGuidelines: `
      - Professional sans-serif fonts (Arial, Helvetica)
      - Corporate blue color scheme
      - Conservative border radius (2-6px)
      - Clean, professional shadows
      - Structured, grid-based layouts
      - Trustworthy, authoritative design
    `
  },
];

export function getThemeById(id: string): Theme | undefined {
  return themes.find(theme => theme.id === id);
}

export function getThemeGuidelines(themeId: string): string {
  const theme = getThemeById(themeId);
  if (!theme) return '';

  return `
THEME: ${theme.name}
DESCRIPTION: ${theme.description}

COLOR PALETTE:
- Primary: ${theme.colors.primary}
- Secondary: ${theme.colors.secondary}
- Accent: ${theme.colors.accent}
- Background: ${theme.colors.background}
- Text: ${theme.colors.text}

FONTS:
- Headings: ${theme.fonts.heading}
- Body: ${theme.fonts.body}

DESIGN GUIDELINES:
${theme.cssGuidelines}

IMPORTANT: Use these exact colors and fonts. Apply the design guidelines strictly.
  `.trim();
}
