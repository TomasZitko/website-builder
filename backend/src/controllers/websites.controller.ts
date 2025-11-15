import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import * as deploymentService from '../services/deployment.service';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

/**
 * Get all websites for authenticated user
 */
export async function getAllWebsites(req: Request, res: Response) {
  try {
    const userId = req.userId!;

    const { data: websites, error } = await supabase
      .from('websites')
      .select(`
        id,
        name,
        description,
        subdomain,
        custom_domain,
        deployment_status,
        deployment_url,
        total_views,
        unique_visitors,
        preview_image_url,
        is_public,
        created_at,
        updated_at,
        deployed_at
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    res.json({ websites: websites || [] });
  } catch (error: any) {
    console.error('Get websites error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get single website by ID
 */
export async function getWebsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

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
    console.error('Get website error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create new website (called after AI generation)
 */
export async function createWebsite(req: Request, res: Response) {
  try {
    const userId = req.userId!;
    const {
      name,
      description,
      html_code,
      css_code,
      js_code,
      theme,
      subdomain
    } = req.body;

    // Validate required fields
    if (!name || !html_code) {
      return res.status(400).json({ error: 'Name and HTML code are required' });
    }

    // Generate subdomain if not provided
    const finalSubdomain = subdomain || generateSubdomain(name);

    // Check if subdomain is available
    const { data: existing } = await supabase
      .from('websites')
      .select('id')
      .eq('subdomain', finalSubdomain)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    // Create website
    const { data: website, error } = await supabase
      .from('websites')
      .insert({
        user_id: userId,
        name,
        description,
        html_code,
        css_code: css_code || '',
        js_code: js_code || '',
        theme,
        subdomain: finalSubdomain,
        deployment_status: 'draft',
        deployment_provider: 'internal'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ website });
  } catch (error: any) {
    console.error('Create website error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update website
 */
export async function updateWebsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const {
      name,
      description,
      html_code,
      css_code,
      js_code,
      theme
    } = req.body;

    // Verify ownership
    const { data: existing } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Update website
    const { data: website, error } = await supabase
      .from('websites')
      .update({
        name,
        description,
        html_code,
        css_code,
        js_code,
        theme,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ website });
  } catch (error: any) {
    console.error('Update website error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete website
 */
export async function deleteWebsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const { error } = await supabase
      .from('websites')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete website error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Deploy website to Cloudflare Pages
 */
export async function deployWebsite(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Get website
    const { data: website, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Deploy to Cloudflare
    const result = await deploymentService.deployToCloudflare(website, userId);

    res.json(result);
  } catch (error: any) {
    console.error('Deploy website error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Setup custom domain
 */
export async function setupDomain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { domain } = req.body;
    const userId = req.userId!;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const result = await deploymentService.setupCustomDomain(id, domain, userId);

    res.json(result);
  } catch (error: any) {
    console.error('Setup domain error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Verify custom domain
 */
export async function verifyDomain(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { domain } = req.body;
    const userId = req.userId!;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const result = await deploymentService.verifyCustomDomain(id, domain);

    res.json(result);
  } catch (error: any) {
    console.error('Verify domain error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get deployment history
 */
export async function getDeployments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const { data: deployments, error } = await supabase
      .from('deployments')
      .select(`
        id,
        version,
        deployment_status,
        deployment_provider,
        deployment_url,
        deployment_time_ms,
        change_summary,
        triggered_by,
        created_at,
        error_message
      `)
      .eq('website_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ deployments: deployments || [] });
  } catch (error: any) {
    console.error('Get deployments error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get version history for a website
 */
export async function getVersions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Get versions
    const { data: versions, error } = await supabase
      .from('website_versions')
      .select('*')
      .eq('website_id', id)
      .order('version_number', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ versions: versions || [] });
  } catch (error: any) {
    console.error('Get versions error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new version
 */
export async function createVersion(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { html_code, css_code, js_code, change_description } = req.body;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!website) {
      return res.status(404).json({ error: 'Website not found' });
    }

    // Get latest version number
    const { data: latestVersion } = await supabase
      .from('website_versions')
      .select('version_number')
      .eq('website_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

    // Create new version
    const { data: version, error } = await supabase
      .from('website_versions')
      .insert({
        website_id: id,
        version_number: nextVersionNumber,
        html_code: html_code || '',
        css_code: css_code || '',
        js_code: js_code || '',
        change_description: change_description || 'Manual save'
      })
      .select()
      .single();

    if (error) throw error;

    // Also update the main website table
    await supabase
      .from('websites')
      .update({
        html_code,
        css_code,
        js_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    res.status(201).json({ version });
  } catch (error: any) {
    console.error('Create version error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Restore a specific version
 */
export async function restoreVersion(req: Request, res: Response) {
  try {
    const { id, versionId } = req.params;
    const userId = req.userId!;

    // Verify ownership
    const { data: website } = await supabase
      .from('websites')
      .select('id')
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

    // Create a new version from this restore point
    const { data: latestVersion } = await supabase
      .from('website_versions')
      .select('version_number')
      .eq('website_id', id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersionNumber = (latestVersion?.version_number || 0) + 1;

    const { data: newVersion, error: createError } = await supabase
      .from('website_versions')
      .insert({
        website_id: id,
        version_number: nextVersionNumber,
        html_code: version.html_code,
        css_code: version.css_code,
        js_code: version.js_code,
        change_description: `Restored from version ${version.version_number}`
      })
      .select()
      .single();

    if (createError) throw createError;

    // Update the main website table
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

    res.json({ version: newVersion });
  } catch (error: any) {
    console.error('Restore version error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Helper: Generate subdomain from name
 */
function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 63) + '-' + Math.random().toString(36).substring(2, 6);
}
