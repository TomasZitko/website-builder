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

  return `You are an ELITE web designer with 15+ years experience at top agencies (IDEO, Fantasy, Huge). Create a STUNNING, pixel-perfect website that would cost $5000+ if done by an agency. This is your portfolio piece - make it EXTRAORDINARY.

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

⚡ CRITICAL: Tailor ALL content, copy, images, colors, and design to match:
- Target Audience: ${targetAudience} (speak THEIR language, address THEIR pain points)
- Main Goal: ${mainGoal} (optimize EVERY element for this goal)
- Industry: ${websiteType} (use industry-specific terminology and conventions)

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
1. ✅ Pure HTML5, CSS3, vanilla JavaScript (NO frameworks, NO libraries)
2. ✅ Mobile-first responsive (breakpoints: 640px, 768px, 1024px, 1280px)
3. ✅ Smooth scroll behavior with offset for fixed header
4. ✅ Intersection Observer for scroll animations (stagger effects!)
5. ✅ CSS Grid + Flexbox for layouts (NO float, NO tables)
6. ✅ CSS Custom Properties for theming and consistency
7. ✅ Optimized for 60fps animations (use transform/opacity only)
8. ✅ Accessible (ARIA labels, semantic HTML5, keyboard navigation)
9. ✅ SEO optimized (meta tags, Open Graph, structured data)
10. ✅ Fast loading (< 2MB total, inline critical CSS if needed)
11. ✅ Progressive enhancement (works without JS)
12. ✅ Print-friendly styles (@media print)

📊 PERFORMANCE REQUIREMENTS:
- Lazy load images (loading="lazy")
- Use WebP-friendly image URLs (Unsplash with w= parameter)
- Minify inline SVG icons
- Defer non-critical JavaScript
- Preload critical fonts (if using custom fonts)
- Use CSS containment for performance (contain: layout style paint)
- Optimize font loading (font-display: swap)

🔍 SEO & META TAGS (Required in <head>):
<meta name="description" content="[Compelling 155-char description for ${businessName}]">
<meta name="keywords" content="[5-7 relevant keywords for ${websiteType}]">
<meta property="og:title" content="${businessName} - [Value Proposition]">
<meta property="og:description" content="[Same as description]">
<meta property="og:image" content="[Hero image URL]">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="https://[domain]">

♿ ACCESSIBILITY (WCAG 2.1 AA):
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators on all interactive elements
- Alt text for ALL images (descriptive, not "image")
- Semantic HTML (<nav>, <main>, <article>, <section>, etc.)
- Keyboard navigation (Tab, Enter, Escape work perfectly)
- Skip to main content link
- Form labels properly associated
- ARIA landmarks and live regions where appropriate

🎬 ANIMATIONS & INTERACTIONS (Must be buttery smooth!):
- Fade-in + slide-up on scroll (Intersection Observer with 100px rootMargin)
- Stagger animations for lists/grids (delay each item by 100ms)
- Hover effects on ALL interactive elements (cards, buttons, links)
- Smooth color transitions (300ms cubic-bezier(0.4, 0, 0.2, 1))
- Parallax scrolling on hero (subtle, translateY based on scroll)
- Mobile hamburger menu with smooth slide-in animation
- Card hover: translateY(-8px) + shadow increase + scale(1.02)
- Button states: hover (scale(1.05)), active (scale(0.98))
- Loading skeleton animations for async content
- Smooth reveal for images (fade + blur-in effect)
- Microinteractions on form inputs (focus animations)
- Page transition effects (if multi-section)
- Reduced motion support (@prefers-reduced-motion)

💎 MODERN DESIGN PATTERNS (2024/2025):
- Glassmorphism: backdrop-filter: blur(10px) with semi-transparent backgrounds
- Neumorphism: Soft shadows for depth (but use sparingly)
- Gradient meshes: Complex multi-color gradients
- Micro-interactions: Subtle feedback on every action
- Asymmetric layouts: Break the grid intelligently
- Bold typography: Mix of font weights for hierarchy
- Generous white space: Let the content breathe
- Floating elements: Subtle 3D depth with shadows
- Bento box grids: Mixed-size card layouts
- Scroll-triggered reveals: Sections appear as you scroll

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
📝 CONTENT & COPYWRITING EXCELLENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ NEVER use "Lorem ipsum" or generic placeholder text
❌ NEVER use vague language like "we offer quality services"
❌ NEVER write generic descriptions that could apply to any business

✅ Write MAGNETIC copy that makes ${targetAudience} think "THIS IS FOR ME!"
✅ Use BENEFIT-DRIVEN language (not features, BENEFITS!)
✅ Include SPECIFIC numbers and details (not "many clients" → "500+ happy clients")
✅ Create URGENCY and FOMO where appropriate
✅ Add SOCIAL PROOF (testimonials, ratings, client logos)
✅ Use POWER WORDS: proven, guaranteed, exclusive, transform, breakthrough
✅ Apply the AIDA formula: Attention → Interest → Desire → Action

🎯 COPYWRITING FORMULAS to use:
1. Hero Headline: [Desired Outcome] for [Target Audience] without [Common Objection]
   Example for restaurant: "Authentic Italian Cuisine for Food Lovers without Breaking the Bank"

2. Value Proposition: We help [Target] achieve [Benefit] through [Method]
   Example: "We help busy professionals achieve work-life balance through flexible scheduling"

3. Feature → Benefit Translation:
   ❌ "24/7 availability" (feature)
   ✅ "Get help whenever you need it, even at 3 AM" (benefit)

4. Social Proof Formula: [Number] [Target Audience] [Achievement]
   Example: "2,500+ local families trust us for their dental care"

💡 CONTENT SPECIFICS for ${websiteType}:
- Use ${websiteType}-specific terminology (sound like an insider, not an outsider)
- Reference ${targetAudience}'s biggest pain points and desires
- Align ALL messaging with "${mainGoal}"
- Include realistic service/product names (not "Service 1, Service 2")
- Add credibility signals: years in business, awards, certifications, client count
- Use testimonials that address specific objections
- Include a clear, singular CTA on every section (what do you want visitors to DO?)

🎨 VISUAL CONTENT GUIDELINES:
- Use high-quality stock photos from Unsplash (real URLs, not placeholders)
- Choose images that show RESULTS, not just pretty pictures
- For ${websiteType}, use images of: ${websiteType === 'restaurant' ? 'actual dishes, happy diners, chef in action' :
  websiteType === 'gym' ? 'people achieving fitness results, modern equipment, trainer sessions' :
  websiteType === 'salon' ? 'beautiful hair transformations, modern salon interior, happy clients' :
  'relevant industry scenes, happy customers, your service in action'}
- Use REAL person names in testimonials (not "John D.")
- Include specific location references if ${location ? `${location}` : 'local area'} is mentioned

💰 CONVERSION OPTIMIZATION:
- Primary CTA: Bright, contrasting button with action verb ("Get Started", "Book Now", "Claim Offer")
- Secondary CTAs: Links throughout content to nudge visitors
- Scarcity/Urgency: "Limited spots available", "Book this week and save 20%"
- Risk reversal: "Money-back guarantee", "Free consultation", "No obligation"
- Multiple conversion points: CTA in hero, middle sections, and footer
- Make forms SHORT (3-5 fields max, only ask for essentials)
- Clear next steps: Tell visitors EXACTLY what happens after they submit

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
🎯 FINAL CHECKLIST (Review before generating):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Content is 100% custom for ${businessName} (NO generic text)
✅ ALL copy speaks directly to ${targetAudience}
✅ EVERY section optimizes for ${mainGoal}
✅ Design matches ${style} style guidelines perfectly
✅ Meta tags are complete and compelling
✅ Images have descriptive alt text
✅ Animations are smooth (60fps, staggered)
✅ Mobile menu works flawlessly
✅ CTAs are clear, prominent, and action-oriented
✅ Forms are short and user-friendly
✅ Colors have proper contrast
✅ Typography hierarchy is clear
✅ White space creates visual breathing room
✅ Loading performance is optimized
✅ Code is clean, semantic, and commented
✅ Response is valid JSON (no markdown blocks!)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create a website SO EXCEPTIONAL that:
1. ${targetAudience} immediately thinks "This is EXACTLY what I need!"
2. The client would proudly show it to everyone they know
3. Competitors would study it to learn from it
4. It would cost $5000+ if done by a top agency
5. The client never needs another redesign

Think like a $200/hour designer at a premium agency.
This is your PORTFOLIO MASTERPIECE.
Make it ABSOLUTELY PERFECT.

⚡ Generate your BEST WORK NOW! 🚀`;
}
