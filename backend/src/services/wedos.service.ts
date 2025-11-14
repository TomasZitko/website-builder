/**
 * Wedos Integration Service
 *
 * Handles:
 * - WAPI (Wedos API) for domain management
 * - FTP deployment to Wedos hosting
 * - Domain verification
 */

import axios from 'axios';
import * as ftp from 'basic-ftp';
import { createClient } from '@supabase/supabase-js';
import { WedosFTPCredentials, DeploymentResult } from '../types/production.types';
import { decryptPassword, encryptPassword } from './encryption.service';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const WAPI_URL = 'https://api.wedos.com/wapi/json';
const WAPI_USER = process.env.WEDOS_API_USER;
const WAPI_KEY = process.env.WEDOS_API_KEY;

//═══════════════════════════════════════════════════════════
// WAPI - Domain Management
//═══════════════════════════════════════════════════════════

/**
 * Check if domain is available for registration
 */
export async function checkDomainAvailability(domain: string): Promise<boolean> {
  try {
    const response = await callWAPI('domain-check', {
      domain
    });

    return response.data.avail === 1;
  } catch (error: any) {
    console.error('Domain check failed:', error);
    throw new Error(`Failed to check domain: ${error.message}`);
  }
}

/**
 * Register domain via Wedos
 */
export async function registerDomain(
  domain: string,
  userId: string
): Promise<{ success: boolean; domainId?: string; error?: string }> {
  try {
    // Get user contact details
    const { data: user } = await supabase
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    // Register domain via WAPI
    const response = await callWAPI('domain-create', {
      domain,
      period: 1, // 1 year
      owner: {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

    return {
      success: true,
      domainId: response.data.domain_id
    };
  } catch (error: any) {
    console.error('Domain registration failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * List user's domains
 */
export async function listDomains(userId: string): Promise<any[]> {
  try {
    const response = await callWAPI('domains-list', {});
    return response.data.domains || [];
  } catch (error: any) {
    console.error('Failed to list domains:', error);
    return [];
  }
}

/**
 * Update DNS records for custom domain
 */
export async function updateDNSRecords(
  domain: string,
  records: Array<{
    type: 'A' | 'CNAME' | 'TXT';
    name: string;
    value: string;
    ttl?: number;
  }>
): Promise<boolean> {
  try {
    for (const record of records) {
      await callWAPI('dns-row-add', {
        domain,
        type: record.type,
        name: record.name,
        rdata: record.value,
        ttl: record.ttl || 3600
      });
    }

    // Commit DNS changes
    await callWAPI('dns-domain-commit', { domain });

    console.log(`✅ DNS records updated for ${domain}`);
    return true;
  } catch (error: any) {
    console.error('Failed to update DNS:', error);
    return false;
  }
}

//═══════════════════════════════════════════════════════════
// FTP Deployment
//═══════════════════════════════════════════════════════════

/**
 * Test FTP connection
 */
export async function testFTPConnection(
  credentials: WedosFTPCredentials
): Promise<{ success: boolean; error?: string }> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: credentials.ftp_host,
      user: credentials.ftp_username,
      password: credentials.ftp_password,
      port: credentials.ftp_port || 21,
      secure: false // Wedos uses FTPS on port 990 for secure
    });

    // Try to list directory
    await client.list();

    await client.close();

    console.log(`✅ FTP connection successful: ${credentials.ftp_host}`);
    return { success: true };
  } catch (error: any) {
    console.error('FTP connection failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    client.close();
  }
}

/**
 * Deploy website to Wedos FTP
 */
export async function deployToWedosFTP(
  websiteId: string,
  credentials: WedosFTPCredentials
): Promise<DeploymentResult> {
  const startTime = Date.now();
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log(`🚀 Starting Wedos FTP deployment for website: ${websiteId}`);

    // Get website data
    const { data: website } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .single();

    if (!website) {
      throw new Error('Website not found');
    }

    // Update deployment status
    await supabase
      .from('websites')
      .update({ deployment_status: 'deploying' })
      .eq('id', websiteId);

    // Connect to FTP
    await client.access({
      host: credentials.ftp_host,
      user: credentials.ftp_username,
      password: credentials.ftp_password,
      port: credentials.ftp_port || 21,
      secure: false
    });

    // Navigate to web root
    const webRoot = credentials.ftp_path || '/www';
    await client.ensureDir(webRoot);

    // Upload files
    console.log('📁 Uploading index.html...');
    await client.uploadFrom(
      Buffer.from(website.html_code),
      `${webRoot}/index.html`
    );

    if (website.css_code) {
      console.log('📁 Uploading styles.css...');
      await client.uploadFrom(
        Buffer.from(website.css_code),
        `${webRoot}/styles.css`
      );
    }

    if (website.js_code) {
      console.log('📁 Uploading script.js...');
      await client.uploadFrom(
        Buffer.from(website.js_code),
        `${webRoot}/script.js`
      );
    }

    // Upload analytics script
    const analyticsScript = generateAnalyticsScript(websiteId);
    await client.uploadFrom(
      Buffer.from(analyticsScript),
      `${webRoot}/_analytics.js`
    );

    await client.close();

    // Get deployment URL
    const deploymentUrl = website.custom_domain
      ? `https://${website.custom_domain}`
      : `http://${credentials.ftp_host.split('.')[0]}.wedos.net`;

    // Create deployment record
    const version = await getNextVersion(websiteId);
    await supabase.from('deployments').insert({
      website_id: websiteId,
      version,
      deployment_status: 'success',
      deployment_provider: 'wedos',
      deployed_by: website.user_id,
      html_code: website.html_code,
      css_code: website.css_code,
      js_code: website.js_code,
      deployment_url: deploymentUrl,
      deployment_time_ms: Date.now() - startTime,
      triggered_by: 'manual'
    });

    // Update website
    await supabase
      .from('websites')
      .update({
        deployment_status: 'live',
        deployment_provider: 'wedos',
        deployed_at: new Date().toISOString(),
        last_deployed_at: new Date().toISOString(),
        deployment_url: deploymentUrl,
        wedos_ftp_path: webRoot
      })
      .eq('id', websiteId);

    console.log(`✅ Wedos deployment successful: ${deploymentUrl}`);

    return {
      success: true,
      deploymentUrl,
      deploymentTimeMs: Date.now() - startTime,
      version
    };
  } catch (error: any) {
    console.error('❌ Wedos deployment failed:', error);

    client.close();

    // Update deployment status
    await supabase
      .from('websites')
      .update({ deployment_status: 'failed' })
      .eq('id', websiteId);

    // Log failed deployment
    const version = await getNextVersion(websiteId);
    await supabase.from('deployments').insert({
      website_id: websiteId,
      version,
      deployment_status: 'failed',
      deployment_provider: 'wedos',
      deployed_by: (await supabase.from('websites').select('user_id').eq('id', websiteId).single()).data?.user_id,
      html_code: '',
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
 * Save Wedos FTP credentials for user
 */
export async function saveWedosCredentials(
  userId: string,
  credentials: WedosFTPCredentials
): Promise<{ success: boolean; error?: string }> {
  try {
    // Test connection first
    const testResult = await testFTPConnection(credentials);
    if (!testResult.success) {
      return {
        success: false,
        error: `Connection test failed: ${testResult.error}`
      };
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(credentials.ftp_password);

    // Save to user record
    await supabase
      .from('users')
      .update({
        wedos_ftp_host: credentials.ftp_host,
        wedos_ftp_username: credentials.ftp_username,
        wedos_ftp_password_encrypted: encryptedPassword
      })
      .eq('id', userId);

    console.log(`✅ Wedos credentials saved for user ${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save Wedos credentials:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Wedos FTP credentials for user
 */
export async function getWedosCredentials(
  userId: string
): Promise<WedosFTPCredentials | null> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('wedos_ftp_host, wedos_ftp_username, wedos_ftp_password_encrypted')
      .eq('id', userId)
      .single();

    if (!user || !user.wedos_ftp_host) {
      return null;
    }

    // Decrypt password
    const decryptedPassword = decryptPassword(user.wedos_ftp_password_encrypted!);

    return {
      ftp_host: user.wedos_ftp_host,
      ftp_username: user.wedos_ftp_username!,
      ftp_password: decryptedPassword,
      ftp_port: 21,
      ftp_path: '/www'
    };
  } catch (error) {
    console.error('Failed to get Wedos credentials:', error);
    return null;
  }
}

//═══════════════════════════════════════════════════════════
// Helper Functions
//═══════════════════════════════════════════════════════════

/**
 * Call Wedos WAPI
 */
async function callWAPI(command: string, params: any): Promise<any> {
  if (!WAPI_USER || !WAPI_KEY) {
    throw new Error('Wedos API credentials not configured');
  }

  const auth = generateWAPIAuth(command);

  const requestData = {
    request: {
      user: WAPI_USER,
      auth: auth,
      command,
      data: params
    }
  };

  const response = await axios.post(WAPI_URL, requestData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (response.data.response.code !== 1000) {
    throw new Error(response.data.response.result || 'WAPI request failed');
  }

  return response.data.response;
}

/**
 * Generate WAPI authentication hash
 */
function generateWAPIAuth(command: string): string {
  const crypto = require('crypto');
  const hour = new Date().getHours().toString();

  // WAPI auth: SHA1(user + SHA1(password) + hour)
  const passwordHash = crypto
    .createHash('sha1')
    .update(WAPI_KEY!)
    .digest('hex');

  const authString = `${WAPI_USER}${passwordHash}${hour}`;

  return crypto
    .createHash('sha1')
    .update(authString)
    .digest('hex');
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
 * Generate analytics tracking script
 */
function generateAnalyticsScript(websiteId: string): string {
  const API_URL = process.env.API_URL || 'https://api.webchat.cz';

  return `
(function() {
  'use strict';
  const websiteId = '${websiteId}';
  const apiUrl = '${API_URL}/api/v1/analytics';

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

  const startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    navigator.sendBeacon(apiUrl + '/duration', JSON.stringify({ website_id: websiteId, duration }));
  });

  if (document.readyState === 'complete') {
    trackPageView();
  } else {
    window.addEventListener('load', trackPageView);
  }
})();
`.trim();
}
