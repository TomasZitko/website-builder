import { getThemeGuidelines } from '../../data/themes';
import { DESIGN_MASTER_SYSTEM_PROMPT } from './designMaster';

export function buildCodeGenerationPrompt(requirements: {
  websiteType?: string;
  businessName?: string;
  targetAudience?: string;
  mainGoal?: string;
  location?: string;
  pricing?: string;
  specialFeatures?: string;
  brandColors?: string;
  pages?: 'single' | 'multi';
  style?: 'modern' | 'bold' | 'professional';
  selectedTheme?: string;
  inspirationContext?: string; // Pre-formatted inspiration text from inspiration.service
}): string {
  const {
    websiteType,
    businessName,
    targetAudience,
    mainGoal,
    location,
    pricing,
    specialFeatures,
    brandColors,
    pages,
    style,
    selectedTheme,
    inspirationContext
  } = requirements;

  const isMultiPage = pages === 'multi';
  const pagesList = isMultiPage
    ? ['Home', 'About', 'Services', 'Contact']
    : ['Home (single page with all sections)'];

  // Get theme guidelines if theme is selected
  const themeGuidelines = selectedTheme ? getThemeGuidelines(selectedTheme) : '';

  return `${DESIGN_MASTER_SYSTEM_PROMPT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PROJECT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BUSINESS NAME: ${businessName || 'Business Name'}
INDUSTRY: ${websiteType || 'business'}
TARGET AUDIENCE: ${targetAudience || 'general audience'}
MAIN GOAL: ${mainGoal || 'provide information'}
${location ? `LOCATION: ${location}` : ''}
${pricing ? `PRICING: ${pricing}` : ''}
${specialFeatures ? `SPECIAL FEATURES: ${specialFeatures}` : ''}
${brandColors ? `BRAND COLORS: ${brandColors}` : ''}
WEBSITE TYPE: ${pagesList.join(', ')}
DESIGN STYLE: ${style || 'modern'}

CRITICAL: Tailor ALL content, copy, and design decisions to:
- Target Audience: ${targetAudience || 'general audience'}
- Main Goal: ${mainGoal || 'provide information'}
- Industry: ${websiteType || 'business'}

${themeGuidelines ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎨 SELECTED THEME GUIDELINES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${themeGuidelines}\n` : ''}

${inspirationContext ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 DESIGN INSPIRATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${inspirationContext}\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 STYLE-SPECIFIC REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${style === 'modern'
  ? `MODERN MINIMAL STYLE:
- Ultra-clean design with generous white space (min 4rem between sections)
- Contemporary typography (Inter, Plus Jakarta Sans, Outfit)
- Glassmorphism: backdrop-filter: blur(20px) on cards and nav
- Subtle gradients: linear-gradient(135deg, #6366f1, #8b5cf6)
- Soft shadows: box-shadow: 0 8px 32px rgba(0,0,0,0.1)
- Primary color: #6366F1 (indigo)
- Background: Clean white #FFFFFF or subtle gradient
- Text: #1F2937 (dark gray), high contrast
- Accent: #8B5CF6 (purple) for CTAs
- Border radius: min 1rem for cards, 0.5rem for buttons
- Smooth transitions: 300ms cubic-bezier(0.4, 0, 0.2, 1)`
  : ''}${style === 'bold'
  ? `BOLD & VIBRANT STYLE:
- Dark-first design (#0f0f23 or #1a1a2e background)
- Vibrant gradients: linear-gradient(135deg, #FF6B6B, #4ECDC4)
- Large, impactful typography (H1: 4rem+, font-weight: 800)
- Neon glow effects: box-shadow: 0 0 20px rgba(primary, 0.6)
- High contrast colors for maximum impact
- Animated gradient backgrounds
- Bold CTAs with glow on hover
- Electric accent colors (#00f2fe, #ff6b9d)
- Strong geometric shapes
- Energetic animations (scale, pulse)`
  : ''}${style === 'professional'
  ? `PROFESSIONAL CORPORATE STYLE:
- Classic corporate aesthetic
- Primary: #2563EB (professional blue)
- Clean sans-serif fonts (Inter, system-ui)
- Structured grid layouts with clear hierarchy
- Professional photography placeholders
- Conservative color palette (blues, grays, white)
- Subtle shadows: box-shadow: 0 4px 16px rgba(0,0,0,0.08)
- Trustworthy, authoritative vibe
- Clear information architecture
- Minimal but purposeful animations
- Business-focused iconography`
  : ''}

${isMultiPage ? `
📄 MULTI-PAGE STRUCTURE:
Create a seamless single-page experience with smooth scroll:
- Navigation: #home, #about, #services, #contact
- Each section minimum 100vh height
- Sticky header with active link highlighting
- Smooth scroll with 80px offset for header
` : `
📄 SINGLE-PAGE STRUCTURE:
1. 🎯 HERO SECTION (100vh):
   - Compelling headline specific to ${websiteType}
   - Subheading explaining value proposition
   - CTA button (e.g., "Get Started", "Contact Us")
   - Background: gradient or subtle pattern

2. 💼 ABOUT SECTION:
   - Story about ${businessName}
   - Why choose us (3-4 bullet points)
   - Stats or achievements (in animated counter boxes)

3. 🛠️ SERVICES/PRODUCTS SECTION:
   - Grid of 3-6 service cards
   - Icons or imagery for each service
   - Hover effects revealing more details
   - Relevant to ${websiteType}

4. 📬 CONTACT SECTION:
   - Email, phone, location
   - Clean contact form (name, email, message)
   - Social media links
   - Map placeholder or background
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CONTENT REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ NO "Lorem ipsum" or placeholder text!
✅ Generate REAL, industry-specific content for ${websiteType}
✅ Write compelling copy that sells
✅ Include realistic business details
✅ Use action-oriented language
✅ Add credibility indicators (years in business, clients served, etc.)

For ${websiteType}, include:
- Industry-specific terminology
- Relevant services/products
- Appropriate value propositions
- Professional tone matching the industry

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 CSS BEST PRACTICES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
:root {
  /* Colors */
  --primary: ${style === 'modern' ? '#6366F1' : style === 'bold' ? '#FF6B6B' : '#2563EB'};
  --secondary: ${style === 'modern' ? '#8B5CF6' : style === 'bold' ? '#4ECDC4' : '#1E40AF'};
  --background: ${style === 'modern' ? '#FFFFFF' : style === 'bold' ? '#1A1A2E' : '#F9FAFB'};
  --text: ${style === 'modern' ? '#1F2937' : style === 'bold' ? '#FFFFFF' : '#111827'};

  /* Spacing */
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 2rem;
  --spacing-lg: 4rem;
  --spacing-xl: 6rem;

  /* Animations */
  --transition-fast: 200ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

/* Use modern CSS features */
- CSS Grid for layouts
- CSS Custom Properties
- clamp() for responsive typography
- aspect-ratio for media
- backdrop-filter for glass effects

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a valid JSON object (no markdown, no explanation):
{
  "files": {
    "index.html": "<!DOCTYPE html>...",
    "style.css": "/* Beautiful CSS */...",
    "script.js": "// Smooth interactions..."
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create a website SO GOOD that the client would:
1. Show it to their friends
2. Pay $5000+ for it
3. Never need another designer

This is your MASTERPIECE. Make it PERFECT.

Generate NOW. 🚀`;
}
