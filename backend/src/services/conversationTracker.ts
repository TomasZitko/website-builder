export interface ConversationState {
  // Required fields
  websiteType?: string;
  businessName?: string;
  targetAudience?: string;
  mainGoal?: string;

  // Optional fields
  location?: string;
  pricing?: string;
  specialFeatures?: string;
  brandColors?: string;

  // Legacy fields (for backward compatibility)
  pages?: 'single' | 'multi';
  style?: 'modern' | 'bold' | 'professional';

  // Theme selection
  selectedTheme?: string;
  readyToGenerate: boolean;
  showThemeSelection: boolean;
  questionsAsked: {
    type: boolean;
    name: boolean;
    targetAudience: boolean;
    mainGoal: boolean;
    location: boolean | 'skipped';
    pricing: boolean | 'skipped';
    specialFeatures: boolean | 'skipped';
    brandColors: boolean | 'skipped';
  };
}

export function extractConversationState(messages: any[]): ConversationState {
  const state: ConversationState = {
    readyToGenerate: false,
    showThemeSelection: false,
    questionsAsked: {
      type: false,
      name: false,
      targetAudience: false,
      mainGoal: false,
      location: false,
      pricing: false,
      specialFeatures: false,
      brandColors: false
    }
  };

  // Check for GENERATE_NOW trigger (updated from READY_TO_GENERATE)
  const lastAssistantMsg = messages
    .filter(m => m.role === 'assistant')
    .pop();

  if (lastAssistantMsg?.content.includes('GENERATE_NOW')) {
    state.readyToGenerate = true;
  }

  // Extract from ALL messages
  const allText = messages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Detect website type
  const types = [
    'bakery', 'salon', 'restaurant', 'cafe', 'coffee shop',
    'portfolio', 'gym', 'fitness', 'shop', 'store', 'ecommerce',
    'blog', 'personal', 'business', 'company', 'agency',
    'hotel', 'spa', 'clinic', 'dental', 'medical', 'lawyer',
    'photography', 'art', 'music', 'band', 'event'
  ];

  for (const type of types) {
    if (allText.includes(type)) {
      state.websiteType = type;
      state.questionsAsked.type = true;
      break;
    }
  }

  // Detect business name (look for user messages after "name" question)
  const namePatterns = [
    /name.*?is\s+([A-Z][a-zA-Z\s]+)/i,
    /called\s+([A-Z][a-zA-Z\s]+)/i,
    /^([A-Z][a-zA-Z\s]{2,30})$/m
  ];

  for (const message of messages) {
    if (message.role === 'user') {
      for (const pattern of namePatterns) {
        const match = message.content.match(pattern);
        if (match) {
          state.businessName = match[1].trim();
          state.questionsAsked.name = true;
          break;
        }
      }
    }
  }

  // Detect target audience
  const audienceKeywords = [
    'families', 'family', 'kids', 'children',
    'professionals', 'corporate', 'business people',
    'travelers', 'tourists', 'visitors',
    'luxury', 'high-end', 'premium',
    'budget', 'affordable', 'students',
    'young', 'millennials', 'gen z',
    'seniors', 'elderly', 'retirees',
    'local', 'community', 'neighborhood'
  ];

  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    if (content.includes('target') || content.includes('audience') ||
        content.includes('customer') || content.includes('client')) {
      const audienceMatch = message.content.match(/(?:target|audience|customer|client)[:\s]+([^.!?\n]{5,100})/i);
      if (audienceMatch) {
        state.targetAudience = audienceMatch[1].trim();
        state.questionsAsked.targetAudience = true;
        break;
      }
    }

    for (const keyword of audienceKeywords) {
      if (content.includes(keyword)) {
        state.targetAudience = keyword;
        state.questionsAsked.targetAudience = true;
        break;
      }
    }
    if (state.targetAudience) break;
  }

  // Detect main goal
  const goalPatterns = {
    'generate bookings': ['booking', 'reservation', 'book', 'reserve', 'appointments'],
    'showcase portfolio': ['portfolio', 'showcase', 'display work', 'show work'],
    'sell products': ['sell', 'ecommerce', 'shop', 'buy', 'purchase', 'store'],
    'provide information': ['information', 'inform', 'educate', 'about'],
    'capture leads': ['leads', 'contact', 'inquiries', 'get in touch'],
    'build brand awareness': ['brand', 'awareness', 'presence', 'visibility']
  };

  for (const [goal, keywords] of Object.entries(goalPatterns)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      state.mainGoal = goal;
      state.questionsAsked.mainGoal = true;
      break;
    }
  }

  // Detect location (optional)
  const locationPatterns = [
    /(?:located in|based in|from|in)\s+([A-Z][a-zA-Z\s,]{2,50})/i,
    /(?:city|location)[:\s]+([A-Z][a-zA-Z\s,]{2,50})/i
  ];

  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content;

    if (content.toLowerCase().includes('skip') && allText.includes('location')) {
      state.questionsAsked.location = 'skipped';
      break;
    }

    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        state.location = match[1].trim();
        state.questionsAsked.location = true;
        break;
      }
    }
    if (state.location || state.questionsAsked.location === 'skipped') break;
  }

  // Detect pricing (optional)
  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    if (content.includes('skip') && allText.includes('pricing')) {
      state.questionsAsked.pricing = 'skipped';
      break;
    }

    if (/\$|€|£|price|cost|from|starting/.test(content)) {
      const pricingMatch = message.content.match(/([^.!?\n]{10,100}(?:\$|€|£|price|cost)[^.!?\n]{0,100})/i);
      if (pricingMatch) {
        state.pricing = pricingMatch[1].trim();
        state.questionsAsked.pricing = true;
        break;
      }
    }
  }

  // Detect special features (optional)
  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    if (content.includes('skip') || content.includes('standard')) {
      state.questionsAsked.specialFeatures = 'skipped';
      break;
    }

    const featureKeywords = ['booking', 'gallery', 'testimonials', 'blog', 'contact form'];
    if (featureKeywords.some(keyword => content.includes(keyword))) {
      state.specialFeatures = message.content;
      state.questionsAsked.specialFeatures = true;
      break;
    }
  }

  // Detect brand colors (optional)
  for (const message of messages.filter(m => m.role === 'user')) {
    const content = message.content.toLowerCase();

    if (content.includes('skip') || content.includes('no preference')) {
      state.questionsAsked.brandColors = 'skipped';
      break;
    }

    if (/#[0-9A-F]{6}/i.test(content) || /blue|red|green|yellow|purple|pink|orange/i.test(content)) {
      state.brandColors = message.content;
      state.questionsAsked.brandColors = true;
      break;
    }
  }

  // Legacy: Detect pages preference (for backward compatibility)
  if (allText.includes('single page') || allText.includes('one page')) {
    state.pages = 'single';
  } else if (allText.includes('multi') || allText.includes('multiple')) {
    state.pages = 'multi';
  }

  // Legacy: Detect style (for backward compatibility)
  if (allText.includes('modern') || allText.includes('minimal')) {
    state.style = 'modern';
  } else if (allText.includes('bold') || allText.includes('vibrant')) {
    state.style = 'bold';
  } else if (allText.includes('professional') || allText.includes('corporate')) {
    state.style = 'professional';
  }

  // Detect selected theme from user messages (reduced to 4 premium themes)
  const themeMap: { [key: string]: string } = {
    '1': 'modern-minimal',
    '2': 'luxury-elegant',
    '3': 'warm-cozy',
    '4': 'bold-vibrant',
    'modern minimal': 'modern-minimal',
    'luxury elegant': 'luxury-elegant',
    'warm & cozy': 'warm-cozy',
    'warm cozy': 'warm-cozy',
    'bold & vibrant': 'bold-vibrant',
    'bold vibrant': 'bold-vibrant'
  };

  for (const message of messages) {
    if (message.role === 'user') {
      const content = message.content.toLowerCase().trim();

      // Check for direct number or full theme name match only
      for (const [key, themeId] of Object.entries(themeMap)) {
        if (content === key || (key.length > 2 && content.includes(key))) {
          state.selectedTheme = themeId;
          break;
        }
      }

      if (state.selectedTheme) break;
    }
  }

  // Check if we should show theme selection
  // Show themes after collecting all REQUIRED info (optional fields can be skipped)
  const readyForThemes =
    state.questionsAsked.type &&
    state.questionsAsked.name &&
    state.questionsAsked.targetAudience &&
    state.questionsAsked.mainGoal;

  // Show themes if we have required info but user hasn't selected a theme yet
  state.showThemeSelection = readyForThemes && !state.selectedTheme && !state.readyToGenerate;

  console.log('🔍 Enhanced Conversation State:', JSON.stringify(state, null, 2));

  return state;
}
