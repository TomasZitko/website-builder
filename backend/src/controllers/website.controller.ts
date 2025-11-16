import { Request, Response } from 'express';
import { generateWebsiteCode } from '../services/gemini.service';
import { createClient } from '@supabase/supabase-js';
import { ConversationState } from '../services/conversationTracker';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function generateWebsite(req: Request, res: Response) {
  try {
    const { conversationState, sessionId } = req.body;
    const userId = req.userId;

    console.log('🌐 Generate website request:', {
      userId,
      sessionId,
      conversationState
    });

    if (!conversationState) {
      return res.status(400).json({ error: 'Conversation state required' });
    }

    // Generate code using Gemini
    console.log('🚀 Starting code generation...');
    const generatedCode = await generateWebsiteCode(conversationState);

    // Save to database
    const { data: website, error } = await supabase
      .from('websites')
      .insert({
        user_id: userId,
        name: conversationState.businessName || 'Untitled Website',
        description: `A ${conversationState.style || 'modern'} website for ${conversationState.websiteType || 'business'}`,
        html_code: generatedCode.files['index.html'],
        css_code: generatedCode.files['style.css'],
        js_code: generatedCode.files['script.js'] || '',
        theme: conversationState.style,
        is_published: false,
        is_paid: false
      })
      .select()
      .single();

    if (error) throw error;

    console.log('💾 Website saved to database:', website.id);

    // Link to chat session
    if (sessionId) {
      await supabase
        .from('chat_sessions')
        .update({ website_id: website.id })
        .eq('id', sessionId);
      console.log('🔗 Linked to chat session:', sessionId);
    }

    console.log('✅ Website generation complete!');

    res.json({
      website: {
        id: website.id,
        name: website.name,
        htmlCode: website.html_code,
        cssCode: website.css_code,
        jsCode: website.js_code,
        previewUrl: `https://preview.webchat.cz/${website.id}`
      },
      message: 'Website generated successfully!'
    });
  } catch (error: any) {
    console.error('❌ Website generation error:', error);
    res.status(500).json({
      error: 'Failed to generate website',
      message: error.message
    });
  }
}

export async function getAllWebsites(req: Request, res: Response) {
  try {
    const userId = req.userId;

    const { data: websites, error } = await supabase
      .from('websites')
      .select('id, name, description, theme, is_paid, is_published, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      websites: websites || []
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch websites',
      message: error.message
    });
  }
}

export async function getWebsiteById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { data: website, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    res.json({ website });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch website',
      message: error.message
    });
  }
}

export async function updateWebsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { htmlCode, cssCode, jsCode } = req.body;
    const userId = req.userId;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Update
    const { error } = await supabase
      .from('websites')
      .update({
        html_code: htmlCode || website.html_code,
        css_code: cssCode || website.css_code,
        js_code: jsCode || website.js_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Website updated successfully' });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update website',
      message: error.message
    });
  }
}

export async function deleteWebsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!website || website.user_id !== userId) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Delete
    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Website deleted successfully' });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to delete website',
      message: error.message
    });
  }
}

export async function getWebsiteVersions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!website || website.user_id !== userId) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Get all versions for this website
    const { data: versions, error } = await supabase
      .from('website_versions')
      .select('*')
      .eq('website_id', id)
      .order('version_number', { ascending: false });

    if (error) throw error;

    res.json({
      versions: versions || []
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch versions',
      message: error.message
    });
  }
}

export async function restoreVersion(req: Request, res: Response) {
  try {
    const { id, versionId } = req.params;
    const userId = req.userId;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Get the version to restore
    const { data: version, error: versionError } = await supabase
      .from('website_versions')
      .select('*')
      .eq('id', versionId)
      .eq('website_id', id)
      .single();

    if (versionError || !version) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Create a new version with current state before restoring
    const { data: currentVersions } = await supabase
      .from('website_versions')
      .select('version_number')
      .eq('website_id', id)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersionNumber = currentVersions && currentVersions.length > 0
      ? currentVersions[0].version_number + 1
      : 1;

    await supabase
      .from('website_versions')
      .insert({
        website_id: id,
        version_number: nextVersionNumber,
        html_code: website.html_code,
        css_code: website.css_code,
        js_code: website.js_code,
        change_description: `Auto-save before restoring to v${version.version_number}`
      });

    // Restore the version
    const { error: updateError } = await supabase
      .from('websites')
      .update({
        html_code: version.html_code,
        css_code: version.css_code,
        js_code: version.js_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Create a new version for the restore
    await supabase
      .from('website_versions')
      .insert({
        website_id: id,
        version_number: nextVersionNumber + 1,
        html_code: version.html_code,
        css_code: version.css_code,
        js_code: version.js_code,
        change_description: `Restored from v${version.version_number}`
      });

    res.json({
      message: 'Version restored successfully',
      restoredVersion: version.version_number
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to restore version',
      message: error.message
    });
  }
}
