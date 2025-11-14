import { getThemeGuidelines } from '../../data/themes';

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

  return `You are an ELITE web designer. Create a STUNNING, professional website that would cost $5000+ if done by an agency.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BUSINESS INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${businessName || 'Business Name'}
Industry: ${websiteType || 'business'}
Target Audience: ${targetAudience || 'general audience'}
Main Goal: ${mainGoal || 'provide information'}
${location ? `Location: ${location}` : ''}
${pricing ? `Pricing: ${pricing}` : ''}
${specialFeatures ? `Special Features: ${specialFeatures}` : ''}
${brandColors ? `Brand Colors: ${brandColors}` : ''}
Website Type: ${pagesList.join(', ')}
Design Style: ${style || 'modern'}

IMPORTANT: Tailor ALL content, copy, and design decisions to the target audience (${targetAudience}) and main goal (${mainGoal}).

${themeGuidelines ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎨 THEME GUIDELINES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${themeGuidelines}\n` : ''}

${inspirationContext ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💡 ${inspirationContext}\n` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ DESIGN EXCELLENCE REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 VISUAL IMPACT:
${style === 'modern'
  ? `- Ultra-clean minimalist design with generous white space
- Contemporary typography (Inter, Poppins style)
- Subtle gradients and soft shadows
- Accent color: #6366F1 (indigo)
- Background: pure white #FFFFFF
- Text: #1F2937 (dark gray)
- Use CSS backdrop-filter for glassmorphism effects`
  : ''}${style === 'bold'
  ? `- Vibrant, energetic color palette
- Dark mode first (#1A1A2E background)
- Bold gradients: linear-gradient(135deg, #FF6B6B, #4ECDC4)
- Large, impactful typography
- Neon accents and glowing effects
- High contrast for maximum impact`
  : ''}${style === 'professional'
  ? `- Corporate sophistication
- Classic blue palette (#2563EB primary)
- Clean sans-serif fonts (system-ui)
- Structured grid layouts
- Professional photography placeholders
- Trustworthy, authoritative vibe`
  : ''}

🚀 TECHNICAL EXCELLENCE:
1. ✅ Pure HTML5, CSS3, vanilla JavaScript (NO frameworks)
2. ✅ Mobile-first responsive (breakpoints: 640px, 768px, 1024px, 1280px)
3. ✅ Smooth scroll behavior with offset for fixed header
4. ✅ Intersection Observer for scroll animations
5. ✅ CSS Grid + Flexbox for layouts
6. ✅ CSS Custom Properties for theming
7. ✅ Optimized for 60fps animations
8. ✅ Accessible (ARIA labels, semantic HTML)

🎬 ANIMATIONS & INTERACTIONS:
- Fade-in on scroll (using Intersection Observer)
- Hover effects on all interactive elements
- Smooth color transitions (300ms ease)
- Parallax scrolling on hero section
- Mobile hamburger menu with smooth slide-in
- Card hover lift effects (transform: translateY(-10px))
- Button ripple effects
- Smooth page loading animation

📱 MOBILE MENU:
- Hamburger icon (animated to X on click)
- Full-screen overlay menu
- Slide-in from right with backdrop blur
- Touch-friendly 60px tap targets
- Close on link click

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
