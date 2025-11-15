import { genAI, GEMINI_MODEL } from '../config/gemini';
import { buildCodeGenerationPrompt } from './prompts/codeGenerationPrompt';
import { buildEnhancedCodePrompt } from './prompts/design/codeGenerationEnhanced';
import { ConversationState } from './conversationTracker';
import { searchDesignInspiration, formatInspirationForPrompt } from './inspiration.service';

interface GeneratedWebsite {
  files: {
    'index.html': string;
    'style.css': string;
    'script.js': string;
  };
}

export async function generateWebsiteCode(
  conversationState: ConversationState
): Promise<GeneratedWebsite> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    // Fetch design inspiration (Pinterest/Unsplash/Pexels)
    console.log('🎨 Fetching design inspiration...');
    const inspirations = await searchDesignInspiration(
      conversationState.websiteType || 'business',
      conversationState.style || conversationState.selectedTheme || 'modern',
      3 // Get 3 inspiration images
    );
    const inspirationContext = formatInspirationForPrompt(inspirations);

    // Build enhanced 2025 design prompt from conversation state
    const prompt = buildEnhancedCodePrompt({
      websiteType: conversationState.websiteType || 'business',
      businessName: conversationState.businessName || 'Your Business',
      targetAudience: conversationState.targetAudience,
      mainGoal: conversationState.mainGoal,
      location: conversationState.location,
      pricing: conversationState.pricing,
      specialFeatures: conversationState.specialFeatures,
      brandColors: conversationState.brandColors,
      pages: conversationState.pages || 'single',
      style: conversationState.style || 'modern',
      selectedTheme: conversationState.selectedTheme,
      inspirationContext // Add design inspiration context
    });

    console.log('🎨 Generating website with enhanced prompt:', {
      websiteType: conversationState.websiteType,
      businessName: conversationState.businessName,
      targetAudience: conversationState.targetAudience,
      mainGoal: conversationState.mainGoal,
      location: conversationState.location,
      pricing: conversationState.pricing,
      specialFeatures: conversationState.specialFeatures,
      brandColors: conversationState.brandColors,
      pages: conversationState.pages,
      style: conversationState.style,
      selectedTheme: conversationState.selectedTheme
    });

    // Generate content
    console.log('🔮 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📄 Gemini response length:', text.length);

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No JSON found in response. Raw text:', text.substring(0, 500));
      throw new Error('Failed to extract JSON from Gemini response');
    }

    const generatedCode: GeneratedWebsite = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!generatedCode.files ||
        !generatedCode.files['index.html'] ||
        !generatedCode.files['style.css']) {
      console.error('❌ Invalid structure:', Object.keys(generatedCode));
      throw new Error('Invalid code structure returned from Gemini');
    }

    console.log('✅ Website code generated successfully');
    console.log('📊 HTML size:', generatedCode.files['index.html'].length);
    console.log('📊 CSS size:', generatedCode.files['style.css'].length);
    console.log('📊 JS size:', generatedCode.files['script.js']?.length || 0);

    // Sanitize code (basic XSS prevention)
    generatedCode.files['index.html'] = sanitizeHTML(generatedCode.files['index.html']);

    return generatedCode;
  } catch (error: any) {
    console.error('❌ Gemini generation error:', error);
    throw new Error(`Code generation failed: ${error.message}`);
  }
}

function sanitizeHTML(html: string): string {
  // Remove dangerous patterns
  const dangerous = [
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];

  let sanitized = html;
  for (const pattern of dangerous) {
    sanitized = sanitized.replace(pattern, '');
  }

  return sanitized;
}

export async function regenerateSection(
  currentCode: string,
  sectionToChange: string,
  changeDescription: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are editing an existing website. Here is the current code:

${currentCode}

USER REQUEST: ${changeDescription}
SECTION TO MODIFY: ${sectionToChange}

Return ONLY the complete modified code (full HTML, CSS, and JS), maintaining the existing structure but incorporating the requested changes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error: any) {
    console.error('Gemini regeneration error:', error);
    throw new Error(`Failed to regenerate section: ${error.message}`);
  }
}
