/**
 * Conversational Flow Questions for DesignMaster AI
 * These questions guide users through website creation
 */

export interface ConversationalQuestion {
  id: string;
  question: string;
  placeholder?: string;
  optional?: boolean;
  validation?: (answer: string) => boolean;
}

export const CONVERSATIONAL_QUESTIONS: ConversationalQuestion[] = [
  {
    id: 'websiteType',
    question: "Hi! I'm here to help you build your website. What type of business do you have? (e.g., bakery, salon, restaurant, portfolio)",
    placeholder: "E.g., bakery, salon, portfolio...",
    optional: false,
  },
  {
    id: 'businessName',
    question: "Great! What's the name of your business?",
    placeholder: "Your business name",
    optional: false,
  },
  {
    id: 'targetAudience',
    question: "Who is your target audience? (e.g., families, young professionals, luxury clients)",
    placeholder: "E.g., families, young professionals...",
    optional: false,
  },
  {
    id: 'mainGoal',
    question: "What's the main goal of your website? (e.g., generate bookings, showcase portfolio, sell products, provide information)",
    placeholder: "E.g., generate bookings, showcase work...",
    optional: false,
  },
  {
    id: 'location',
    question: "Where is your business located? (Optional - type 'skip' to skip)",
    placeholder: "E.g., New York, London... or 'skip'",
    optional: true,
  },
  {
    id: 'pricing',
    question: "What are your pricing details? (Optional - type 'skip' to skip)",
    placeholder: "E.g., From $50, Custom quotes... or 'skip'",
    optional: true,
  },
  {
    id: 'specialFeatures',
    question: "Any special features you'd like? (e.g., booking system, gallery, testimonials, blog) (Optional - type 'skip' to skip)",
    placeholder: "E.g., booking system, gallery... or 'skip'",
    optional: true,
  },
  {
    id: 'brandColors',
    question: "Do you have any preferred brand colors? (Optional - type 'skip' to skip)",
    placeholder: "E.g., blue and gold, #FF6B6B... or 'skip'",
    optional: true,
  },
];

/**
 * Theme options for website design
 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

export const THEMES: Theme[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, contemporary, lots of white space',
  },
  {
    id: 'luxury-elegant',
    name: 'Luxury Elegant',
    description: 'Sophisticated, premium, refined',
  },
  {
    id: 'warm-cozy',
    name: 'Warm & Cozy',
    description: 'Inviting, friendly, comfortable',
  },
  {
    id: 'bold-vibrant',
    name: 'Bold & Vibrant',
    description: 'Energetic, colorful, eye-catching',
  },
  {
    id: 'nature-organic',
    name: 'Nature Organic',
    description: 'Earthy, natural, eco-friendly',
  },
  {
    id: 'tech-futuristic',
    name: 'Tech Futuristic',
    description: 'Cutting-edge, innovative, high-tech',
  },
  {
    id: 'classic-timeless',
    name: 'Classic Timeless',
    description: 'Traditional, elegant, never outdated',
  },
  {
    id: 'playful-creative',
    name: 'Playful Creative',
    description: 'Fun, unique, artistic',
  },
  {
    id: 'professional-corporate',
    name: 'Professional Corporate',
    description: 'Business-focused, trustworthy',
  },
];
