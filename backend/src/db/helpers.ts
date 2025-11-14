import { supabase } from './supabase'
import crypto from 'crypto'

/**
 * Encryption utilities for sensitive data (e.g., FTP passwords)
 */
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn('⚠️  ENCRYPTION_KEY not set or invalid. Encryption will not work properly.')
}

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured')

  const iv = crypto.randomBytes(16)
  const key = Buffer.from(ENCRYPTION_KEY, 'hex')
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  // Return: iv + authTag + encrypted (all in hex)
  return iv.toString('hex') + authTag.toString('hex') + encrypted
}

/**
 * Decrypt sensitive data using AES-256-GCM
 */
export function decrypt(encryptedData: string): string {
  if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured')

  const key = Buffer.from(ENCRYPTION_KEY, 'hex')

  // Extract iv (32 chars), authTag (32 chars), encrypted (rest)
  const iv = Buffer.from(encryptedData.slice(0, 32), 'hex')
  const authTag = Buffer.from(encryptedData.slice(32, 64), 'hex')
  const encrypted = encryptedData.slice(64)

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Generate a random encryption key (32 bytes = 64 hex chars for AES-256)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Database query helpers
 */

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
}) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData] as any)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update user profile
 */
export async function updateUser(id: string, updates: any) {
  const { data, error } = await supabase
    .from('users')
    // @ts-expect-error - Supabase type inference issue with generic updates
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get websites by user ID
 */
export async function getWebsitesByUserId(userId: string) {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get website by ID
 */
export async function getWebsiteById(id: string) {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

/**
 * Create a new website
 */
export async function createWebsite(websiteData: {
  user_id: string
  name: string
  html_code: string
  css_code?: string
  js_code?: string
  description?: string
}) {
  const { data, error } = await supabase
    .from('websites')
    .insert([websiteData] as any)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update website
 */
export async function updateWebsite(id: string, updates: any) {
  const { data, error } = await supabase
    .from('websites')
    // @ts-expect-error - Supabase type inference issue with generic updates
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete website
 */
export async function deleteWebsite(id: string) {
  const { error } = await supabase
    .from('websites')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Create website version (for history/undo)
 */
export async function createWebsiteVersion(versionData: {
  website_id: string
  version_number: number
  html_code: string
  css_code?: string
  js_code?: string
  change_description?: string
}) {
  const { data, error } = await supabase
    .from('website_versions')
    .insert([versionData] as any)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get website versions
 */
export async function getWebsiteVersions(websiteId: string) {
  const { data, error } = await supabase
    .from('website_versions')
    .select('*')
    .eq('website_id', websiteId)
    .order('version_number', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Log usage for analytics and rate limiting
 */
export async function logUsage(logData: {
  user_id: string
  action: string
  api_endpoint?: string
  request_method?: string
  response_status?: number
  ai_model?: string
  tokens_used?: number
  cost_estimate?: number
  ip_address?: string
  user_agent?: string
}) {
  const { error } = await supabase
    .from('usage_logs')
    .insert([logData] as any)

  if (error) console.error('Failed to log usage:', error)
}

/**
 * Get user's usage logs for the last N days
 */
export async function getUserUsageLogs(userId: string, days: number = 30) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', cutoffDate.toISOString())
    .order('timestamp', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get all active templates
 */
export async function getActiveTemplates() {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('usage_count', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get template by ID
 */
export async function getTemplateById(id: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

/**
 * Create payment record
 */
export async function createPayment(paymentData: {
  user_id: string
  website_id?: string
  stripe_payment_intent_id: string
  amount: number
  currency?: string
  payment_type?: string
  description?: string
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData] as any)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentIntentId: string,
  status: string,
  updates?: any
) {
  const { data, error } = await supabase
    .from('payments')
    // @ts-expect-error - Supabase type inference issue with generic updates
    .update({ status, ...updates })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select()
    .single()

  if (error) throw error
  return data
}
