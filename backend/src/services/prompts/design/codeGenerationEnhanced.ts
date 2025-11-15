import { DESIGN_MASTER_2025_PROMPT } from './designMaster2025';
import { getThemeGuidelines } from '../../../data/themes';

export function buildEnhancedCodePrompt(requirements: {
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
  inspirationContext?: string;
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
  const themeGuidelines = selectedTheme ? getThemeGuidelines(selectedTheme) : '';

  // Map themes to color palettes
  const colorPaletteMap: Record<string, string> = {
    'modern-minimal': 'Modern Cyan',
    'luxury-elegant': 'Sophisticated Purple',
    'warm-cozy': 'Warm Sunset',
    'bold-vibrant': 'Emerald Fresh'
  };

  const selectedPalette = selectedTheme
    ? colorPaletteMap[selectedTheme] || 'Sophisticated Purple'
    : 'Sophisticated Purple';

  return `${DESIGN_MASTER_2025_PROMPT}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PROJECT BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Business Name: ${businessName || 'Your Business'}
Industry: ${websiteType || 'business'}
Target Audience: ${targetAudience || 'general audience'}
Main Goal: ${mainGoal || 'provide information'}
${location ? `Location: ${location}` : ''}
${pricing ? `Pricing: ${pricing}` : ''}
${specialFeatures ? `Special Features: ${specialFeatures}` : ''}
${brandColors ? `Brand Colors: ${brandColors}` : ''}
Design Theme: ${selectedTheme || 'modern'}
Color Palette: ${selectedPalette}
Website Type: ${isMultiPage ? 'Multi-page' : 'Single-page'}

${themeGuidelines ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 SELECTED THEME GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${themeGuidelines}
` : ''}

${inspirationContext ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 DESIGN INSPIRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${inspirationContext}

Use these as visual inspiration for layout, color schemes, and styling.
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR SPECIFIC TASK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a ${isMultiPage ? 'multi-page' : 'single-page'} website for ${businessName || 'this business'}.

REQUIRED SECTIONS:
${isMultiPage ? `
1. HOME PAGE
   • Hero section with compelling headline
   • Brief introduction (2-3 sentences)
   • Key benefits or features (3-4 items)
   • Call-to-action

2. ABOUT PAGE
   • Company story
   • Mission/values
   • Team introduction (optional)

3. SERVICES/PRODUCTS PAGE
   • Main offerings (grid layout)
   • Detailed descriptions
   ${pricing ? `• Pricing: ${pricing}` : ''}

4. CONTACT PAGE
   • Contact form (name, email, message)
   • Contact information
   ${location ? `• Location: ${location}` : ''}
   • Social media links
` : `
All sections on ONE page:

1. HERO SECTION (100vh)
   • Attention-grabbing headline for ${websiteType}
   • Compelling subheadline
   • Primary CTA button
   • Animated gradient background

2. ABOUT SECTION
   • Brief company story (3-4 paragraphs)
   • Why choose us (3-4 key points)
   • Achievement stats (if applicable)

3. SERVICES/PRODUCTS SECTION
   • Grid of 3-6 offerings
   • Each with icon, title, description
   • Relevant to ${websiteType}
   ${pricing ? `• Pricing: ${pricing}` : ''}

4. TESTIMONIALS (optional but recommended)
   • 2-3 customer testimonials
   • With names and roles
   • Star ratings

5. CONTACT SECTION
   • Contact form with glass effect
   • Contact details
   ${location ? `• Location: ${location}` : ''}
   • Social media links
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CONTENT GENERATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NEVER use "Lorem ipsum" or generic placeholders!
✅ Generate REAL, industry-specific content

For a ${websiteType} business:
• Use appropriate industry terminology
• Write compelling, benefit-focused copy
• Create realistic service/product descriptions
• Generate believable testimonials
• Include relevant calls-to-action
• Match tone to ${targetAudience}

Content should be:
✓ Professional yet engaging
✓ Focused on benefits, not features
✓ Action-oriented (clear CTAs)
✓ Tailored to target audience
✓ Optimized for conversion goal: ${mainGoal}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 MANDATORY DESIGN IMPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU MUST IMPLEMENT:

1. GLASSMORPHISM EVERYWHERE
   • Navigation bar with glass effect
   • All cards with backdrop-filter blur
   • Semi-transparent overlays
   • Soft borders on all containers

2. LIQUID GRADIENTS
   • Hero background: animated gradient
   • Section backgrounds: subtle gradients
   • Buttons: gradient fills
   • Text highlights: gradient text effect

3. 2025 TYPOGRAPHY
   • Import Inter font from Google Fonts
   • Use clamp() for responsive sizing
   • Proper hierarchy (H1 > H2 > H3 > P)
   • Gradient text for main headline

4. SMOOTH ANIMATIONS
   • Fade in on scroll (Intersection Observer)
   • Button hover effects (lift + glow)
   • Card hover effects (lift + shadow)
   • Smooth transitions (300ms ease)
   • Hamburger menu animation

5. RESPONSIVE DESIGN
   • Mobile-first approach
   • Breakpoints: 640px, 768px, 1024px
   • Hamburger menu on mobile
   • Flexible grids
   • Responsive typography with clamp()

6. ACCESSIBILITY
   • Semantic HTML5 tags
   • ARIA labels where needed
   • Focus indicators on all interactive elements
   • Alt text on images
   • Proper heading hierarchy

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 TECHNICAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML (index.html):
✓ Valid HTML5 with DOCTYPE
✓ All required meta tags (SEO, OG, Twitter)
✓ Semantic structure (header, nav, main, section, footer)
✓ Accessibility attributes (aria-label, alt, role)
✓ Google Fonts import (Inter)

CSS (style.css):
✓ CSS Custom Properties for theme
✓ Mobile-first media queries
✓ Modern layout (Grid + Flexbox)
✓ Glassmorphism effects
✓ Smooth animations
✓ Responsive typography with clamp()
✓ No CSS frameworks - pure custom CSS

JavaScript (script.js):
✓ Vanilla JavaScript only (no libraries)
✓ Smooth scroll navigation
✓ Mobile menu toggle
✓ Intersection Observer for scroll animations
✓ Form validation (basic)
✓ No jQuery or other dependencies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return EXACTLY this JSON structure (no markdown, no explanation):

{
  "files": {
    "index.html": "<!DOCTYPE html>\\n<html lang=\\"en\\">\\n...",
    "style.css": "/* 2025 Design System */\\n:root {\\n...",
    "script.js": "// Smooth Interactions\\n'use strict';\\n..."
  }
}

CRITICAL OUTPUT RULES:
✓ Return ONLY valid JSON
✓ No markdown code blocks
✓ No explanatory text before/after JSON
✓ Properly escaped quotes in strings
✓ All three files must be complete
✓ HTML must be production-ready
✓ CSS must include all styles
✓ JS must handle all interactions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ QUALITY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before returning your code, verify:
☐ Glassmorphism effects on cards/nav
☐ Liquid gradient backgrounds
☐ Responsive on all screen sizes
☐ Smooth scroll navigation works
☐ Mobile menu functional
☐ All content is industry-specific (no Lorem ipsum)
☐ Color contrast meets WCAG AA
☐ Focus indicators visible
☐ Meta tags complete
☐ Code is clean and well-formatted
☐ Animations are smooth (60fps)
☐ Forms have validation
☐ Images have alt text
☐ Heading hierarchy is correct

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a website so stunning that:
✓ ${targetAudience} immediately feel engaged
✓ ${mainGoal} is crystal clear
✓ The design reflects 2025 trends perfectly
✓ It looks like a $10,000 agency project
✓ The client will be amazed

This is your MASTERPIECE for ${businessName}.

Make it PERFECT. Make it BEAUTIFUL. Make it CONVERT.

Generate NOW. 🚀`;
}
