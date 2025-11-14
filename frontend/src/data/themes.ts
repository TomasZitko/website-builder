export interface Theme {
  id: string;
  name: string;
  description: string;
  preview: string;
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
  keywords: string[];
}

export const themes: Theme[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean lines, lots of white space, contemporary feel',
    preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
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
    keywords: ['minimal', 'clean', 'modern', 'simple', 'contemporary', 'professional'],
  },
  {
    id: 'luxury-elegant',
    name: 'Luxury Elegant',
    description: 'Sophisticated, premium, refined aesthetics',
    preview: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop',
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
    keywords: ['luxury', 'elegant', 'sophisticated', 'premium', 'refined', 'upscale'],
  },
  {
    id: 'warm-cozy',
    name: 'Warm & Cozy',
    description: 'Inviting, comfortable, friendly atmosphere',
    preview: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=300&fit=crop',
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
    keywords: ['warm', 'cozy', 'friendly', 'inviting', 'comfortable', 'welcoming'],
  },
  {
    id: 'bold-vibrant',
    name: 'Bold & Vibrant',
    description: 'Energetic, colorful, eye-catching design',
    preview: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop',
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
    keywords: ['bold', 'vibrant', 'colorful', 'energetic', 'dynamic', 'fun'],
  },

  // ═══════════════════════════════════════
  // ARCHIVED THEMES (kept for reference, not actively used)
  // Uncomment if you want to expand from 4 to more themes
  // ═══════════════════════════════════════
  /*
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description: 'Earthy tones, natural elements, eco-friendly',
    preview: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
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
    keywords: ['nature', 'organic', 'eco', 'earthy', 'natural', 'green'],
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'Cutting-edge, innovative, modern technology',
    preview: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
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
    keywords: ['tech', 'futuristic', 'modern', 'innovative', 'digital', 'high-tech'],
  },
  {
    id: 'classic-timeless',
    name: 'Classic Timeless',
    description: 'Traditional, elegant, never goes out of style',
    preview: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop',
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
    keywords: ['classic', 'timeless', 'traditional', 'elegant', 'formal', 'professional'],
  },
  {
    id: 'playful-creative',
    name: 'Playful Creative',
    description: 'Fun, unique, artistic expression',
    preview: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
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
    keywords: ['playful', 'creative', 'fun', 'artistic', 'unique', 'quirky'],
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    description: 'Business-focused, trustworthy, authoritative',
    preview: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
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
    keywords: ['professional', 'corporate', 'business', 'trustworthy', 'formal', 'authoritative'],
  },
  */
];

// Helper function to get theme by ID
export const getThemeById = (id: string): Theme | undefined => {
  return themes.find(theme => theme.id === id);
};

// Helper function to get theme styling CSS
export const getThemeCSS = (theme: Theme): string => {
  return `
:root {
  --color-primary: ${theme.colors.primary};
  --color-secondary: ${theme.colors.secondary};
  --color-accent: ${theme.colors.accent};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  --font-heading: ${theme.fonts.heading};
  --font-body: ${theme.fonts.body};
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-primary);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-secondary);
}

.btn-accent {
  background-color: var(--color-accent);
  color: white;
}
`.trim();
};
