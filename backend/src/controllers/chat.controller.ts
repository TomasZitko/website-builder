import { Request, Response } from 'express';
import { getChatResponse } from '../services/openai.service';
import { extractConversationState } from '../services/conversationTracker';
import { generateWebsiteCode } from '../services/gemini.service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/**
 * Send a message in a chat session
 * Creates a new session if sessionId is not provided
 */
export async function sendMessage(req: Request, res: Response) {
  try {
    const { message, sessionId } = req.body;
    const userId = req.userId!; // Required by auth middleware

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('\n╔══════════════════════════════════════╗');
    console.log('║  NEW MESSAGE RECEIVED                ║');
    console.log('╚══════════════════════════════════════╝');
    console.log('📤 User message:', message);
    console.log('🆔 Session ID:', sessionId || 'NEW SESSION');
    console.log('👤 User ID:', userId);

    // Get or create session
    let session;
    let isNewSession = false;

    if (sessionId) {
      // Get existing session
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', userId) // Ensure user owns this session
        .single();

      if (error) {
        console.error('❌ Failed to fetch session:', error);
        return res.status(404).json({ error: 'Session not found' });
      }

      session = data;
      console.log('📚 Retrieved session with', session?.messages?.length || 0, 'previous messages');
    } else {
      // Create new session
      console.log('🆕 Creating NEW session for user:', userId);
      const { data: newSession, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          messages: [],
          tokens_used: 0,
          model_used: 'deepseek-chat',
          title: 'New Chat' // Will be auto-generated from first message
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Failed to create session:', insertError);
        return res.status(500).json({ error: 'Failed to create session' });
      }

      session = newSession;
      isNewSession = true;
      console.log('✅ Created new session:', session.id);
    }

    const messages = session.messages || [];
    console.log('💬 Current conversation length:', messages.length, 'messages');

    // If this is a new session and there are no messages, add AI greeting
    if (messages.length === 0) {
      messages.push({
        role: 'assistant',
        content: "Hi! I'm here to help you build your website. What type of business do you have?",
        messageType: 'text',
        timestamp: new Date().toISOString()
      });
    }

    // Add user message
    messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    // Get AI response
    const { response, conversationState, tokensUsed } = await getChatResponse(messages);

    console.log('📥 AI response:', response);

    // Check if AI said "GENERATE_NOW"
    const shouldGenerate = response.includes('GENERATE_NOW');

    // Remove GENERATE_NOW from response shown to user
    let cleanResponse = response.replace('GENERATE_NOW', '').trim() ||
      "Perfect! I'm generating your website now...";

    // Check conversation state to see if we should show theme selection
    const state = extractConversationState(messages);

    let messageType = 'text';
    let metadata = null;

    // If we should show theme selection, send themes as markdown text choices
    if (state.showThemeSelection) {
      cleanResponse = `Perfect! Now choose a visual theme for your website:

**1. Modern Minimal** - Clean, contemporary, lots of white space
**2. Luxury Elegant** - Sophisticated, premium, refined
**3. Warm & Cozy** - Inviting, friendly, comfortable
**4. Bold & Vibrant** - Energetic, colorful, eye-catching
**5. Nature Organic** - Earthy, natural, eco-friendly
**6. Tech Futuristic** - Cutting-edge, innovative, high-tech
**7. Classic Timeless** - Traditional, elegant, never outdated
**8. Playful Creative** - Fun, unique, artistic
**9. Professional Corporate** - Business-focused, trustworthy

Just reply with the number (1-9) or name!`;
      messageType = 'text';
      metadata = null;
    }

    // If generation is starting, change message type
    if (shouldGenerate) {
      cleanResponse = "Perfect! I have everything I need. I'll start creating your website now. This will take about 30-60 seconds...";
      messageType = 'generating';
      metadata = {
        statusMessages: [
          'Opening preview panel...',
          'Generating website structure...',
          'Applying your chosen theme...',
          'Creating responsive layouts...',
          'Adding your business information...',
          'Optimizing for all devices...',
          'Finalizing design details...'
        ]
      };
    }

    // Add assistant message
    messages.push({
      role: 'assistant',
      content: cleanResponse,
      messageType,
      metadata,
      timestamp: new Date().toISOString()
    });

    // Update session with new messages
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        messages,
        tokens_used: (session.tokens_used || 0) + tokensUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('❌ Failed to update session:', updateError);
      return res.status(500).json({ error: 'Failed to save message' });
    }

    console.log('✅ Updated session:', session.id, 'with', messages.length, 'messages');
    console.log('🤖 Conversation State:', conversationState);
    console.log('🚀 Should Generate:', shouldGenerate);

    // 🔥 AUTOMATIC GPT → GEMINI HANDOFF
    let generatedWebsite = null;
    if (shouldGenerate) {
      try {
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎨 GPT → GEMINI HANDOFF INITIATED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Passing conversation state to Gemini:');
        console.log('   Business:', state.businessName);
        console.log('   Type:', state.websiteType);
        console.log('   Style:', state.style);
        console.log('   Theme:', state.selectedTheme);
        console.log('   Pages:', state.pages);

        // Call Gemini to generate the website
        const generatedCode = await generateWebsiteCode(state);

        console.log('✅ Gemini code generation complete!');

        // Save website to database
        const { data: website, error: websiteError } = await supabase
          .from('websites')
          .insert({
            user_id: userId,
            name: state.businessName || 'Untitled Website',
            description: `A ${state.style || 'modern'} website for ${state.websiteType || 'business'}`,
            html_code: generatedCode.files['index.html'],
            css_code: generatedCode.files['style.css'],
            js_code: generatedCode.files['script.js'] || '',
            theme: state.selectedTheme || state.style,
            is_published: false,
            is_paid: false
          })
          .select()
          .single();

        if (websiteError) {
          console.error('❌ Failed to save website:', websiteError);
          throw websiteError;
        }

        console.log('💾 Website saved to database:', website.id);

        // Link website to chat session
        await supabase
          .from('chat_sessions')
          .update({ website_id: website.id })
          .eq('id', session.id);

        console.log('🔗 Linked website to chat session');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ FULL GENERATION COMPLETE!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        generatedWebsite = {
          id: website.id,
          name: website.name,
          htmlCode: website.html_code,
          cssCode: website.css_code,
          jsCode: website.js_code,
          theme: website.theme
        };
      } catch (error: any) {
        console.error('❌ Generation failed:', error);
        generatedWebsite = {
          error: 'Generation failed: ' + error.message
        };
      }
    }

    res.json({
      response: {
        role: 'assistant',
        content: cleanResponse,
        messageType,
        metadata,
        timestamp: messages[messages.length - 1].timestamp
      },
      sessionId: session.id,
      isNewSession, // Frontend will use this to redirect to /builder/:id
      codeGenerated: shouldGenerate,
      conversationState: state,
      tokensUsed,
      generatedWebsite
    });
  } catch (error: any) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
}

/**
 * Get all chat sessions for the authenticated user
 */
export async function getUserSessions(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        last_message_at,
        messages,
        website_id,
        is_public
      `)
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch sessions:', error);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }

    // Transform sessions to include message count
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      title: session.title,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      lastMessageAt: session.last_message_at,
      messageCount: session.messages?.length || 0,
      hasWebsite: !!session.website_id,
      isPublic: session.is_public
    }));

    res.json({ sessions: transformedSessions });
  } catch (error: any) {
    console.error('❌ Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

/**
 * Get a specific chat session
 */
export async function getSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error: any) {
    console.error('❌ Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
}

/**
 * Delete a chat session
 */
export async function deleteSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to delete session:', error);
      return res.status(500).json({ error: 'Failed to delete session' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
}

/**
 * Archive a chat session
 */
export async function archiveSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const { error } = await supabase
      .from('chat_sessions')
      .update({ is_archived: true })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Failed to archive session:', error);
      return res.status(500).json({ error: 'Failed to archive session' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error archiving session:', error);
    res.status(500).json({ error: 'Failed to archive session' });
  }
}
