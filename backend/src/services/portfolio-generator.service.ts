/**
 * Portfolio Generator Service
 *
 * Generates 10 stunning demo websites for developer accounts
 * Makes freelancers/agencies look ESTABLISHED from day 1
 */

import { supabase } from '../db/supabase';
import { generateWebsiteCode } from './gemini.service';
import { ConversationState } from './conversationTracker';
import { PortfolioWebsite } from '../types/b2b2c';

const PORTFOLIO_CATEGORIES = [
  {
    category: 'restaurant',
    name: 'Bella Italia Restaurant',
    clientName: 'Giuseppe & Maria Romano',
    description: 'Elegant Italian dining experience',
    technologies: ['HTML5', 'CSS3', 'Vanilla JS', 'Responsive Design'],
    testimonial: 'Absolutely stunning website! Our bookings increased by 40% in the first month.',
    targetAudience: 'Families and food enthusiasts',
    mainGoal: 'increase restaurant bookings'
  },
  {
    category: 'hotel',
    name: 'Mountain Peak Resort',
    clientName: 'Alpine Hospitality Group',
    description: 'Luxury mountain resort website',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Booking Integration'],
    testimonial: 'Professional, modern, and exactly what we envisioned. Highly recommended!',
    targetAudience: 'Luxury travelers and adventure seekers',
    mainGoal: 'showcase amenities and drive bookings'
  },
  {
    category: 'portfolio',
    name: 'Sarah Chen Photography',
    clientName: 'Sarah Chen',
    description: 'Professional photography portfolio',
    technologies: ['HTML5', 'CSS3', 'Lightbox Gallery', 'Contact Forms'],
    testimonial: 'Beautiful portfolio that perfectly showcases my work. Worth every penny!',
    targetAudience: 'Wedding couples and corporate clients',
    mainGoal: 'showcase photography portfolio'
  },
  {
    category: 'ecommerce',
    name: 'Urban Threads Boutique',
    clientName: 'Emma & Alex Johnson',
    description: 'Fashion e-commerce store',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'E-commerce Features'],
    testimonial: 'Our online sales tripled! The design is sleek and our customers love it.',
    targetAudience: 'Fashion-conscious millennials',
    mainGoal: 'sell clothing and accessories online'
  },
  {
    category: 'business',
    name: 'Apex Consulting',
    clientName: 'David Martinez',
    description: 'Corporate consulting firm',
    technologies: ['HTML5', 'CSS3', 'Professional Design', 'Lead Forms'],
    testimonial: 'Professional website that perfectly represents our brand. Excellent work!',
    targetAudience: 'CEOs and business decision makers',
    mainGoal: 'generate consulting leads'
  },
  {
    category: 'fitness',
    name: 'Iron Temple Gym',
    clientName: 'Marcus Williams',
    description: 'High-energy fitness center',
    technologies: ['HTML5', 'CSS3', 'Animation Effects', 'Class Schedule'],
    testimonial: 'The website captures the energy of our gym perfectly. New memberships up 60%!',
    targetAudience: 'Fitness enthusiasts aged 20-40',
    mainGoal: 'attract new gym members'
  },
  {
    category: 'spa',
    name: 'Serenity Day Spa',
    clientName: 'Dr. Lisa Park',
    description: 'Luxury spa and wellness center',
    technologies: ['HTML5', 'CSS3', 'Booking System', 'Serene Design'],
    testimonial: 'Calming, elegant, and functional. Our clients love booking online now.',
    targetAudience: 'Professionals seeking relaxation',
    mainGoal: 'increase spa bookings'
  },
  {
    category: 'creative',
    name: 'Canvas & Code Studio',
    clientName: 'Olivia & Jake Thompson',
    description: 'Creative design agency',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Interactive Portfolio'],
    testimonial: 'Bold, creative, and memorable. This website got us featured in design blogs!',
    targetAudience: 'Startups and creative businesses',
    mainGoal: 'showcase creative work and attract clients'
  },
  {
    category: 'legal',
    name: 'Sterling Law Firm',
    clientName: 'Attorney Robert Sterling',
    description: 'Professional law practice',
    technologies: ['HTML5', 'CSS3', 'Trust-Building Design', 'Contact System'],
    testimonial: 'Trustworthy, professional design that instills confidence. Client inquiries up 3x.',
    targetAudience: 'Individuals needing legal services',
    mainGoal: 'generate legal consultations'
  },
  {
    category: 'real-estate',
    name: 'Skyline Properties',
    clientName: 'Jennifer & Michael Davis',
    description: 'Luxury real estate agency',
    technologies: ['HTML5', 'CSS3', 'Property Listings', 'Virtual Tours'],
    testimonial: 'Elegant website that showcases properties beautifully. Best investment we made!',
    targetAudience: 'Luxury home buyers',
    mainGoal: 'showcase property listings'
  }
];

/**
 * Generate complete portfolio for a developer account
 */
export async function generateDeveloperPortfolio(
  developerId: string,
  count: number = 10
): Promise<PortfolioWebsite[]> {
  console.log(`🎨 Generating portfolio of ${count} websites for developer: ${developerId}`);

  const portfolioWebsites: PortfolioWebsite[] = [];
  const categoriesToUse = PORTFOLIO_CATEGORIES.slice(0, count);

  for (let i = 0; i < categoriesToUse.length; i++) {
    const template = categoriesToUse[i];

    try {
      console.log(`\n📐 Generating ${i + 1}/${count}: ${template.name} (${template.category})`);

      // Build conversation state for AI generation
      const conversationState: ConversationState = {
        websiteType: template.category,
        businessName: template.name,
        targetAudience: template.targetAudience,
        mainGoal: template.mainGoal,
        style: getStyleForCategory(template.category),
        selectedTheme: getThemeForCategory(template.category),
        pages: 'single'
      };

      // Generate website code with AI
      const generated = await generateWebsiteCode(conversationState);

      // Calculate fake completion date (1-12 months ago)
      const monthsAgo = Math.floor(Math.random() * 12) + 1;
      const fakeDate = new Date();
      fakeDate.setMonth(fakeDate.getMonth() - monthsAgo);

      // Insert into database
      const { data, error } = await supabase
        .from('portfolio_websites')
        .insert({
          developer_id: developerId,
          name: template.name,
          description: template.description,
          category: template.category,
          html_code: generated.files['index.html'],
          css_code: generated.files['style.css'],
          js_code: generated.files['script.js'] || '',
          is_featured: i < 3, // First 3 are featured
          display_order: i,
          is_visible: true,
          fake_client_name: template.clientName,
          fake_completion_date: fakeDate.toISOString().split('T')[0],
          fake_technologies: template.technologies,
          fake_testimonial: template.testimonial
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error saving portfolio website ${i + 1}:`, error);
        throw error;
      }

      console.log(`✅ Generated: ${template.name}`);
      portfolioWebsites.push(data as PortfolioWebsite);

      // Small delay to avoid rate limits
      if (i < categoriesToUse.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      console.error(`❌ Failed to generate ${template.name}:`, error.message);
      // Continue with next one even if one fails
    }
  }

  // Mark portfolio as generated
  await supabase
    .from('users')
    .update({ portfolio_generated: true })
    .eq('id', developerId);

  console.log(`\n🎉 Portfolio generation complete! Generated ${portfolioWebsites.length}/${count} websites`);

  return portfolioWebsites;
}

/**
 * Get portfolio websites for a developer
 */
export async function getPortfolioWebsites(developerId: string): Promise<PortfolioWebsite[]> {
  const { data, error } = await supabase
    .from('portfolio_websites')
    .select('*')
    .eq('developer_id', developerId)
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }

  return data as PortfolioWebsite[];
}

/**
 * Get featured portfolio websites (for public display)
 */
export async function getFeaturedPortfolio(developerId: string): Promise<PortfolioWebsite[]> {
  const { data, error } = await supabase
    .from('portfolio_websites')
    .select('*')
    .eq('developer_id', developerId)
    .eq('is_visible', true)
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured portfolio:', error);
    throw error;
  }

  return data as PortfolioWebsite[];
}

/**
 * Update portfolio website visibility
 */
export async function updatePortfolioVisibility(
  portfolioId: string,
  isVisible: boolean
): Promise<void> {
  const { error } = await supabase
    .from('portfolio_websites')
    .update({ is_visible: isVisible })
    .eq('id', portfolioId);

  if (error) {
    throw error;
  }
}

/**
 * Delete portfolio website
 */
export async function deletePortfolioWebsite(portfolioId: string): Promise<void> {
  const { error } = await supabase
    .from('portfolio_websites')
    .delete()
    .eq('id', portfolioId);

  if (error) {
    throw error;
  }
}

/**
 * Regenerate entire portfolio
 */
export async function regeneratePortfolio(developerId: string): Promise<PortfolioWebsite[]> {
  // Delete existing portfolio
  await supabase
    .from('portfolio_websites')
    .delete()
    .eq('developer_id', developerId);

  // Generate new one
  return generateDeveloperPortfolio(developerId, 10);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getStyleForCategory(category: string): 'modern' | 'bold' | 'professional' {
  const styleMap: Record<string, 'modern' | 'bold' | 'professional'> = {
    restaurant: 'modern',
    hotel: 'professional',
    portfolio: 'modern',
    ecommerce: 'bold',
    business: 'professional',
    fitness: 'bold',
    spa: 'modern',
    creative: 'bold',
    legal: 'professional',
    'real-estate': 'professional'
  };

  return styleMap[category] || 'modern';
}

function getThemeForCategory(category: string): string {
  const themeMap: Record<string, string> = {
    restaurant: 'warm-cozy',
    hotel: 'luxury-elegant',
    portfolio: 'modern-minimal',
    ecommerce: 'bold-vibrant',
    business: 'modern-minimal',
    fitness: 'bold-vibrant',
    spa: 'luxury-elegant',
    creative: 'bold-vibrant',
    legal: 'modern-minimal',
    'real-estate': 'luxury-elegant'
  };

  return themeMap[category] || 'modern-minimal';
}
