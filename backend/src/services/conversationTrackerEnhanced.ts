export interface EnhancedConversationState {
  // Required fields
  businessType?: string;
  businessName?: string;
  targetAudience?: string;
  mainGoal?: string;

  // Optional fields (can be skipped)
  location?: string;
  pricing?: string;
  specialFeatures?: string;
  brandColors?: string;

  // Theme selection
  selectedTheme?: string;

  // Control flags
  readyToGenerate: boolean;
  showThemeSelection: boolean;

  // Track what's been asked/answered
  questionsAnswered: {
    businessType: boolean;
    businessName: boolean;
    targetAudience: boolean;
    mainGoal: boolean;
    location: boolean | 'skipped';
    pricing: boolean | 'skipped';
    specialFeatures: boolean | 'skipped';
    brandColors: boolean | 'skipped';
  };
}

export function extractEnhancedConversationState(messages: any[]): EnhancedConversationState {
  const state: EnhancedConversationState = {
    readyToGenerate: false,
    showThemeSelection: false,
    questionsAnswered: {
      businessType: false,
      businessName: false,
      targetAudience: false,
      mainGoal: false,
      location: false,
      pricing: false,
      specialFeatures: false,
      brandColors: false
    }
  };

  // Check for GENERATE_NOW trigger
  const lastAssistantMsg = messages
    .filter(m => m.role === 'assistant')
    .pop();

  if (lastAssistantMsg?.content.includes('GENERATE_NOW')) {
    state.readyToGenerate = true;
  }

  // Get all text for pattern matching
  const allText = messages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // ══════════════════════════════════════
  // 1. EXTRACT BUSINESS TYPE
  // ══════════════════════════════════════
  const businessTypes = [
    'hotel', 'accommodation', 'resort', 'hostel', 'bnb', 'bed and breakfast',
    'restaurant', 'cafe', 'coffee shop', 'bistro', 'bar', 'pub',
    'bakery', 'salon', 'barbershop', 'spa', 'wellness',
    'gym', 'fitness', 'yoga', 'pilates',
    'shop', 'store', 'ecommerce', 'boutique', 'online store',
    'portfolio', 'personal', 'blog',
    'business', 'company', 'agency', 'consulting',
    'clinic', 'dental', 'medical', 'doctor', 'healthcare',
    'law', 'lawyer', 'attorney', 'legal',
    'photography', 'photographer', 'art', 'artist', 'gallery',
    'music', 'band', 'musician',
    'event', 'wedding', 'planner',
    'real estate', 'property',
    'education', 'school', 'training', 'course',
    'nonprofit', 'charity', 'foundation',
    'tech', 'startup', 'saas', 'software',
    'landing page', 'coming soon'
  ];

  for (const type of businessTypes) {
    if (allText.includes(type)) {
      state.businessType = type;
      state.questionsAnswered.businessType = true;
      break;
    }
  }

  // ══════════════════════════════════════
  // 2. EXTRACT BUSINESS NAME
  // ══════════════════════════════════════
  const namePatterns = [
    /(?:name is|called|named)\s+([A-Z][a-zA-Z\s&'-]{2,50})/i,
    /(?:for|build|create)\s+(?:a\s+)?(?:website\s+for\s+)?([A-Z][a-zA-Z\s&'-]{2,50})/i,
    /^([A-Z][a-zA-Z\s&'-]{2,50})$/m
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      for (const pattern of namePatterns) {
        const match = message.content.match(pattern);
        if (match) {
          const name = match[1].trim();
          // Exclude common words
          if (!['The', 'A', 'An', 'My', 'Our'].includes(name)) {
            state.businessName = name;
            state.questionsAnswered.businessName = true;
            break;
          }
        }
      }
    }
    if (state.businessName) break;
  }

  // ══════════════════════════════════════
  // 3. EXTRACT TARGET AUDIENCE
  // ══════════════════════════════════════
  const audienceKeywords = [
    'families', 'family', 'kids', 'children',
    'professionals', 'corporate', 'business people',
    'travelers', 'tourists', 'visitors',
    'luxury', 'high-end', 'premium',
    'budget', 'affordable', 'students',
    'young', 'millennials', 'gen z',
    'seniors', 'elderly', 'retirees',
    'local', 'community', 'neighborhood',
    'women', 'men', 'everyone'
  ];

  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    // Look for explicit audience mentions
    if (content.includes('target') || content.includes('audience') ||
        content.includes('customer') || content.includes('client')) {
      // Extract the full context
      const audienceMatch = message.content.match(/(?:target|audience|customer|client)[:\s]+([^.!?\n]{5,100})/i);
      if (audienceMatch) {
        state.targetAudience = audienceMatch[1].trim();
        state.questionsAnswered.targetAudience = true;
        break;
      }
    }

    // Look for keyword matches
    for (const keyword of audienceKeywords) {
      if (content.includes(keyword)) {
        state.targetAudience = keyword;
        state.questionsAnswered.targetAudience = true;
        break;
      }
    }

    if (state.targetAudience) break;
  }

  // ══════════════════════════════════════
  // 4. EXTRACT MAIN GOAL
  // ══════════════════════════════════════
  const goalPatterns = {
    'generate bookings': ['booking', 'reservation', 'book', 'reserve', 'appointments'],
    'showcase portfolio': ['portfolio', 'showcase', 'display work', 'show work', 'gallery'],
    'sell products': ['sell', 'ecommerce', 'shop', 'buy', 'purchase', 'store'],
    'provide information': ['information', 'inform', 'educate', 'about us'],
    'capture leads': ['leads', 'contact', 'inquiries', 'get in touch', 'contact form'],
    'build brand awareness': ['brand', 'awareness', 'presence', 'visibility', 'marketing']
  };

  for (const [goal, keywords] of Object.entries(goalPatterns)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      state.mainGoal = goal;
      state.questionsAnswered.mainGoal = true;
      break;
    }
  }

  // ══════════════════════════════════════
  // 5. EXTRACT LOCATION (Optional)
  // ══════════════════════════════════════
  const locationPatterns = [
    /(?:located in|based in|from|in)\s+([A-Z][a-zA-Z\s,]{2,50}(?:USA|UK|Czech|Prague|London|New York|California|Texas|Europe|Asia))/i,
    /(?:city|location|address)[:\s]+([A-Z][a-zA-Z\s,]{2,50})/i
  ];

  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content;

    // Check for skip
    if (content.toLowerCase().includes('skip') ||
        content.toLowerCase().includes('no location') ||
        content.toLowerCase().includes('online only')) {
      state.questionsAnswered.location = 'skipped';
      break;
    }

    // Try to extract location
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        state.location = match[1].trim();
        state.questionsAnswered.location = true;
        break;
      }
    }

    if (state.location || state.questionsAnswered.location === 'skipped') break;
  }

  // ══════════════════════════════════════
  // 6. EXTRACT PRICING (Optional)
  // ══════════════════════════════════════
  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    // Check for skip
    if (content.includes('skip') || content.includes('no pricing') || content === 'no') {
      state.questionsAnswered.pricing = 'skipped';
      break;
    }

    // Look for price indicators
    if (/\$|€|£|price|cost|from|starting/.test(content)) {
      // Extract the pricing information
      const pricingMatch = message.content.match(/([^.!?\n]{10,100}(?:\$|€|£|price|cost)[^.!?\n]{0,100})/i);
      if (pricingMatch) {
        state.pricing = pricingMatch[1].trim();
        state.questionsAnswered.pricing = true;
        break;
      }
    }
  }

  // ══════════════════════════════════════
  // 7. EXTRACT SPECIAL FEATURES (Optional)
  // ══════════════════════════════════════
  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    // Check for skip
    if (content.includes('skip') || content.includes('standard') || content === 'no') {
      state.questionsAnswered.specialFeatures = 'skipped';
      break;
    }

    // Look for feature keywords
    const featureKeywords = ['booking', 'gallery', 'testimonials', 'blog', 'contact form',
                            'newsletter', 'social', 'video', 'chat', 'map'];

    if (featureKeywords.some(keyword => content.includes(keyword))) {
      state.specialFeatures = message.content;
      state.questionsAnswered.specialFeatures = true;
      break;
    }
  }

  // ══════════════════════════════════════
  // 8. EXTRACT BRAND COLORS (Optional)
  // ══════════════════════════════════════
  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    // Check for skip
    if (content.includes('skip') || content.includes('surprise') ||
        content.includes('no preference') || content === 'no') {
      state.questionsAnswered.brandColors = 'skipped';
      break;
    }

    // Look for color indicators
    if (/#[0-9A-F]{6}/i.test(content) ||
        /blue|red|green|yellow|purple|pink|orange|black|white|gray/i.test(content)) {
      state.brandColors = message.content;
      state.questionsAnswered.brandColors = true;
      break;
    }
  }

  // ══════════════════════════════════════
  // 9. EXTRACT SELECTED THEME
  // ══════════════════════════════════════
  const themeMap: { [key: string]: string } = {
    '1': 'modern-minimal',
    '2': 'luxury-elegant',
    '3': 'warm-cozy',
    '4': 'bold-vibrant'
  };

  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.trim().toLowerCase();

    // Check for number selection
    if (themeMap[content]) {
      state.selectedTheme = themeMap[content];
      break;
    }

    // Check for full theme name
    for (const [key, themeId] of Object.entries(themeMap)) {
      const themeName = themeId.replace('-', ' ');
      if (content.includes(themeName)) {
        state.selectedTheme = themeId;
        break;
      }
    }

    if (state.selectedTheme) break;
  }

  // ══════════════════════════════════════
  // DETERMINE IF READY FOR THEME SELECTION
  // ══════════════════════════════════════
  const hasRequiredInfo =
    state.questionsAnswered.businessType &&
    state.questionsAnswered.businessName &&
    state.questionsAnswered.targetAudience &&
    state.questionsAnswered.mainGoal;

  // Show theme selection if we have required info and no theme selected yet
  state.showThemeSelection = hasRequiredInfo && !state.selectedTheme && !state.readyToGenerate;

  console.log('🔍 Enhanced State:', JSON.stringify(state, null, 2));

  return state;
}
