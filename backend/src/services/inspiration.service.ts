/**
 * Design Inspiration Service
 *
 * Searches for design inspiration images from multiple sources:
 * 1. Pinterest API (if configured)
 * 2. Unsplash API (fallback, free tier available)
 * 3. Pexels API (alternative fallback)
 */

import axios from 'axios';

export interface DesignInspiration {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  source: 'pinterest' | 'unsplash' | 'pexels';
  sourceUrl: string;
  colors?: string[]; // Dominant colors extracted
  tags?: string[];
}

// ══════════════════════════════════════
// PINTEREST API (if credentials provided)
// ══════════════════════════════════════

async function searchPinterest(query: string, limit: number = 5): Promise<DesignInspiration[]> {
  const apiKey = process.env.PINTEREST_API_KEY;

  if (!apiKey) {
    console.log('⚠️ Pinterest API key not configured, skipping Pinterest...');
    return [];
  }

  try {
    // Pinterest API v5 endpoint
    const response = await axios.get('https://api.pinterest.com/v5/search/pins', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        query,
        limit
      }
    });

    const pins = response.data.items || [];

    return pins.map((pin: any) => ({
      id: pin.id,
      imageUrl: pin.media?.images?.originals?.url || pin.images?.original?.url,
      thumbnailUrl: pin.media?.images?.['600x']?.url || pin.images?.['600x']?.url,
      title: pin.title || query,
      description: pin.description || '',
      source: 'pinterest' as const,
      sourceUrl: pin.link || `https://pinterest.com/pin/${pin.id}`,
      tags: pin.board?.name ? [pin.board.name] : []
    }));
  } catch (error: any) {
    console.error('❌ Pinterest API error:', error.message);
    return [];
  }
}

// ══════════════════════════════════════
// UNSPLASH API (Free tier: 50 requests/hour)
// ══════════════════════════════════════

async function searchUnsplash(query: string, limit: number = 5): Promise<DesignInspiration[]> {
  const apiKey = process.env.UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_API_KEY;

  if (!apiKey) {
    console.log('⚠️ Unsplash API key not configured');
    return [];
  }

  try {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
      headers: {
        'Authorization': `Client-ID ${apiKey}`
      },
      params: {
        query,
        per_page: limit,
        orientation: 'landscape'
      }
    });

    const photos = response.data.results || [];

    return photos.map((photo: any) => ({
      id: photo.id,
      imageUrl: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      title: photo.alt_description || photo.description || query,
      description: photo.description || `${query} inspiration`,
      source: 'unsplash' as const,
      sourceUrl: photo.links.html,
      colors: photo.color ? [photo.color] : undefined,
      tags: photo.tags?.map((t: any) => t.title) || []
    }));
  } catch (error: any) {
    console.error('❌ Unsplash API error:', error.message);
    return [];
  }
}

// ══════════════════════════════════════
// PEXELS API (Alternative fallback)
// ══════════════════════════════════════

async function searchPexels(query: string, limit: number = 5): Promise<DesignInspiration[]> {
  const apiKey = process.env.PEXELS_API_KEY;

  if (!apiKey) {
    console.log('⚠️ Pexels API key not configured');
    return [];
  }

  try {
    const response = await axios.get('https://api.pexels.com/v1/search', {
      headers: {
        'Authorization': apiKey
      },
      params: {
        query,
        per_page: limit,
        orientation: 'landscape'
      }
    });

    const photos = response.data.photos || [];

    return photos.map((photo: any) => ({
      id: photo.id.toString(),
      imageUrl: photo.src.large,
      thumbnailUrl: photo.src.medium,
      title: photo.alt || query,
      description: `${query} design inspiration`,
      source: 'pexels' as const,
      sourceUrl: photo.url,
      tags: []
    }));
  } catch (error: any) {
    console.error('❌ Pexels API error:', error.message);
    return [];
  }
}

// ══════════════════════════════════════
// MAIN SEARCH FUNCTION (tries all sources)
// ══════════════════════════════════════

export async function searchDesignInspiration(
  businessType: string,
  style: string,
  limit: number = 5
): Promise<DesignInspiration[]> {
  // Build search query
  const query = `${style} ${businessType} website design ui`;

  console.log(`🔍 Searching design inspiration: "${query}"`);

  // Try Pinterest first (best quality)
  let results = await searchPinterest(query, limit);
  if (results.length >= limit) {
    console.log(`✅ Found ${results.length} inspirations from Pinterest`);
    return results;
  }

  // Try Unsplash (good fallback)
  const unsplashResults = await searchUnsplash(query, limit - results.length);
  results = [...results, ...unsplashResults];

  if (results.length >= limit) {
    console.log(`✅ Found ${results.length} inspirations (Pinterest + Unsplash)`);
    return results;
  }

  // Try Pexels (last resort)
  const pexelsResults = await searchPexels(query, limit - results.length);
  results = [...results, ...pexelsResults];

  console.log(`✅ Found ${results.length} inspirations total`);

  // Return what we have (may be less than limit if all APIs failed)
  return results.slice(0, limit);
}

// ══════════════════════════════════════
// COLOR EXTRACTION (from image URL)
// ══════════════════════════════════════

/**
 * Extract dominant colors from an image URL
 * Uses a third-party color extraction service (or could use canvas on server)
 *
 * For now, returns placeholder colors based on style
 * TODO: Implement actual color extraction (e.g., using color-thief or similar)
 */
export function extractDominantColors(imageUrl: string, style: string): string[] {
  // Placeholder implementation - return colors based on style
  const styleColors: { [key: string]: string[] } = {
    'modern': ['#FFFFFF', '#000000', '#3B82F6', '#10B981'],
    'luxury': ['#1A1A1A', '#D4AF37', '#8B7355', '#FFFFFF'],
    'warm': ['#FFF8E7', '#FF6B35', '#F7B733', '#8B4513'],
    'bold': ['#FF006E', '#FFBE0B', '#3A86FF', '#8338EC'],
    'professional': ['#003366', '#0066CC', '#669900', '#F4F4F4']
  };

  // Return colors based on style keyword
  for (const [key, colors] of Object.entries(styleColors)) {
    if (style.toLowerCase().includes(key)) {
      return colors;
    }
  }

  // Default colors
  return ['#3B82F6', '#8B5CF6', '#EC4899', '#FFFFFF'];
}

// ══════════════════════════════════════
// FORMAT INSPIRATION FOR PROMPT
// ══════════════════════════════════════

export function formatInspirationForPrompt(inspirations: DesignInspiration[]): string {
  if (inspirations.length === 0) {
    return 'No specific design references available. Use your best judgment for contemporary design.';
  }

  const formatted = inspirations.map((insp, index) => `
${index + 1}. ${insp.title}
   - Source: ${insp.source}
   - Colors: ${insp.colors?.join(', ') || 'Standard palette'}
   - Tags: ${insp.tags?.join(', ') || 'N/A'}
   - Reference: ${insp.thumbnailUrl}
  `).join('\n');

  return `
DESIGN INSPIRATION REFERENCES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formatted}

IMPORTANT: These are INSPIRATION only. Create an ORIGINAL design influenced by these references.
Do NOT copy exactly - synthesize the best elements into something unique and professional.
`;
}
