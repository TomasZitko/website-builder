/**
 * Deployment Service - Cloudflare Pages Integration
 *
 * Handles deployment to Cloudflare Pages for subdomain and custom domain hosting
 * Supports automatic SSL, global CDN, and instant deployments
 */

import { createClient } from '@supabase/supabase-js';
import FormData from 'form-data';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

interface Website {
  id: string;
  user_id: string;
  name: string;
  subdomain: string;
  custom_domain?: string;
  html_code: string;
  css_code: string;
  js_code: string;
  deployment_status: string;
  deployment_provider: string;
}

interface DeploymentResult {
  success: boolean;
  deploymentUrl: string;
  error?: string;
  deploymentTimeMs: number;
}

/**
 * Deploy website to Cloudflare Pages
 */
export async function deployToCloudflare(
  website: Website,
  userId: string
): Promise<DeploymentResult> {
  const startTime = Date.now();

  try {
    console.log(`🚀 Starting Cloudflare deployment for website: ${website.id}`);

    // Update deployment status to 'deploying'
    await supabase
      .from('websites')
      .update({ deployment_status: 'deploying' })
      .eq('id', website.id);

    // Generate analytics tracking script
    const analyticsScript = generateAnalyticsScript(website.id);

    // Create deployment files
    const files = {
      'index.html': injectAnalytics(website.html_code, analyticsScript),
      'styles.css': website.css_code || '',
      'script.js': website.js_code || '',
      '_analytics.js': analyticsScript,
      '_headers': generateSecurityHeaders()
    };

    // Deploy to Cloudflare Pages
    const deploymentUrl = await deployToCloudflarePages(
      website.subdomain,
      files
    );

    // Create deployment record
    const version = await getNextVersion(website.id);
    await supabase.from('deployments').insert({
      website_id: website.id,
      version,
      deployment_status: 'success',
      deployment_provider: 'internal',
      deployed_by: userId,
      html_code: website.html_code,
      css_code: website.css_code,
      js_code: website.js_code,
      deployment_url: deploymentUrl,
      deployment_time_ms: Date.now() - startTime,
      triggered_by: 'manual'
    });

    // Update website with deployment info
    await supabase
      .from('websites')
      .update({
        deployment_status: 'live',
        deployed_at: new Date().toISOString(),
        last_deployed_at: new Date().toISOString(),
        deployment_url: deploymentUrl,
        ssl_enabled: true
      })
      .eq('id', website.id);

    console.log(`✅ Deployment successful: ${deploymentUrl}`);

    return {
      success: true,
      deploymentUrl,
      deploymentTimeMs: Date.now() - startTime
    };
  } catch (error: any) {
    console.error('❌ Deployment failed:', error);

    // Update deployment status
    await supabase
      .from('websites')
      .update({ deployment_status: 'failed' })
      .eq('id', website.id);

    // Log failed deployment
    const version = await getNextVersion(website.id);
    await supabase.from('deployments').insert({
      website_id: website.id,
      version,
      deployment_status: 'failed',
      deployment_provider: 'internal',
      deployed_by: userId,
      html_code: website.html_code,
      css_code: website.css_code,
      js_code: website.js_code,
      error_message: error.message,
      deployment_time_ms: Date.now() - startTime,
      triggered_by: 'manual'
    });

    return {
      success: false,
      deploymentUrl: '',
      error: error.message,
      deploymentTimeMs: Date.now() - startTime
    };
  }
}

/**
 * Deploy to Cloudflare Pages via API
 */
async function deployToCloudflarePages(
  subdomain: string,
  files: Record<string, string>
): Promise<string> {
  const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  const CF_PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME || 'webchat-sites';

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    // Fallback: Use simple file-based deployment (for MVP)
    return deployToFallbackHosting(subdomain, files);
  }

  try {
    // Create/update Cloudflare Pages project
    const projectUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${subdomain}`;

    // Check if project exists
    let projectExists = false;
    try {
      await axios.get(projectUrl, {
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      projectExists = true;
    } catch (error: any) {
      if (error.response?.status !== 404) throw error;
    }

    // Create project if it doesn't exist
    if (!projectExists) {
      await axios.post(
        `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects`,
        {
          name: subdomain,
          production_branch: 'main'
        },
        {
          headers: {
            'Authorization': `Bearer ${CF_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Deploy files
    const formData = new FormData();

    // Add files to form data
    Object.entries(files).forEach(([filename, content]) => {
      formData.append(filename, Buffer.from(content), filename);
    });

    await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/pages/projects/${subdomain}/deployments`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          ...formData.getHeaders()
        }
      }
    );

    // Return Cloudflare Pages URL
    return `https://${subdomain}.${CF_PROJECT_NAME}.pages.dev`;
  } catch (error: any) {
    console.error('Cloudflare Pages deployment error:', error);
    throw new Error(`Failed to deploy to Cloudflare Pages: ${error.message}`);
  }
}

/**
 * Fallback hosting (simple file storage + CDN)
 * Used when Cloudflare API is not configured
 */
async function deployToFallbackHosting(
  subdomain: string,
  files: Record<string, string>
): Promise<string> {
  // For MVP: Store in Supabase Storage or local files
  // In production: Use Cloudflare R2, S3, or similar

  console.log('⚠️ Using fallback hosting (Cloudflare API not configured)');

  // Store files in Supabase Storage
  const bucket = 'websites';

  for (const [filename, content] of Object.entries(files)) {
    const filePath = `${subdomain}/${filename}`;

    await supabase.storage
      .from(bucket)
      .upload(filePath, Buffer.from(content), {
        contentType: getContentType(filename),
        upsert: true
      });
  }

  // Return public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(`${subdomain}/index.html`);

  return data.publicUrl.replace('/index.html', '');
}

/**
 * Setup custom domain with Cloudflare
 */
export async function setupCustomDomain(
  websiteId: string,
  domain: string,
  userId: string
): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
  try {
    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create verification record
    await supabase.from('domain_verifications').insert({
      website_id: websiteId,
      domain,
      verification_token: verificationToken,
      verification_method: 'dns',
      verification_status: 'pending',
      expected_cname: 'cname.webchat.cz',
      expected_txt: `webchat-verification=${verificationToken}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });

    return {
      success: true,
      verificationToken
    };
  } catch (error: any) {
    console.error('Failed to setup custom domain:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify custom domain ownership
 */
export async function verifyCustomDomain(
  websiteId: string,
  domain: string
): Promise<{ verified: boolean; error?: string }> {
  try {
    // Get verification record
    const { data: verification } = await supabase
      .from('domain_verifications')
      .select('*')
      .eq('website_id', websiteId)
      .eq('domain', domain)
      .single();

    if (!verification) {
      return { verified: false, error: 'Verification not found' };
    }

    // Check DNS records
    const dnsVerified = await verifyDNSRecords(
      domain,
      verification.verification_token
    );

    if (dnsVerified) {
      // Update verification status
      await supabase
        .from('domain_verifications')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', verification.id);

      // Update website
      await supabase
        .from('websites')
        .update({
          custom_domain: domain,
          custom_domain_verified: true
        })
        .eq('id', websiteId);

      return { verified: true };
    } else {
      return {
        verified: false,
        error: 'DNS records not found. Please add the required records.'
      };
    }
  } catch (error: any) {
    console.error('Domain verification error:', error);
    return { verified: false, error: error.message };
  }
}

/**
 * Verify DNS records using DNS lookup
 */
async function verifyDNSRecords(
  domain: string,
  verificationToken: string
): Promise<boolean> {
  const dns = require('dns').promises;

  try {
    // Check TXT record
    const txtRecords = await dns.resolveTxt(domain);
    const hasTxtRecord = txtRecords.some((records: string[]) =>
      records.some(record => record.includes(`webchat-verification=${verificationToken}`))
    );

    // Check CNAME record
    let hasCnameRecord = false;
    try {
      const cnameRecords = await dns.resolveCname(domain);
      hasCnameRecord = cnameRecords.includes('cname.webchat.cz');
    } catch (error) {
      // CNAME might not exist yet
    }

    return hasTxtRecord && hasCnameRecord;
  } catch (error) {
    console.error('DNS verification error:', error);
    return false;
  }
}

/**
 * Generate analytics tracking script
 */
function generateAnalyticsScript(websiteId: string): string {
  const API_URL = process.env.API_URL || 'https://api.webchat.cz';

  return `
(function() {
  'use strict';

  const websiteId = '${websiteId}';
  const apiUrl = '${API_URL}/api/v1/analytics';

  // Track page view
  function trackPageView() {
    const data = {
      website_id: websiteId,
      page_url: window.location.href,
      referrer: document.referrer || 'direct',
      screen_width: screen.width,
      screen_height: screen.height,
      user_agent: navigator.userAgent,
      language: navigator.language,
      timestamp: new Date().toISOString()
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(apiUrl + '/track', JSON.stringify(data));
    } else {
      fetch(apiUrl + '/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {});
    }
  }

  // Track session duration
  const startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const data = { website_id: websiteId, duration };
    navigator.sendBeacon(apiUrl + '/duration', JSON.stringify(data));
  });

  // Track initial page view
  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }
})();
`.trim();
}

/**
 * Inject analytics script into HTML
 */
function injectAnalytics(html: string, analyticsScript: string): string {
  // Insert before closing </body> tag
  const scriptTag = `<script src="/_analytics.js"></script>\n</body>`;
  return html.replace('</body>', scriptTag);
}

/**
 * Generate security headers for Cloudflare Pages
 */
function generateSecurityHeaders(): string {
  return `
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
`.trim();
}

/**
 * Get next deployment version
 */
async function getNextVersion(websiteId: string): Promise<number> {
  const { data } = await supabase
    .from('deployments')
    .select('version')
    .eq('website_id', websiteId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  return (data?.version || 0) + 1;
}

/**
 * Generate verification token
 */
function generateVerificationToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Get content type for file
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp'
  };
  return types[ext || ''] || 'application/octet-stream';
}
