#!/usr/bin/env ts-node
/**
 * Database Migration Runner
 *
 * This script helps run SQL migrations against the Supabase database.
 * While Supabase has a web-based SQL editor, this script can be useful
 * for automated deployments and local testing.
 *
 * Usage:
 *   npm run migrate           # Run all pending migrations
 *   npm run migrate:status    # Check migration status
 */

import { supabase } from './supabase'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations'

/**
 * Create migrations tracking table if it doesn't exist
 * Note: This table should be created manually in Supabase SQL Editor
 */
async function ensureMigrationsTable() {
  // Check if table exists by trying to select from it
  const { error } = await supabase.from(MIGRATIONS_TABLE).select('count').limit(1)

  if (error && error.message.includes('does not exist')) {
    console.warn('⚠️  schema_migrations table does not exist')
    console.warn('Please create it manually in Supabase SQL Editor:')
    console.warn(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `)
    return false
  }
  return true
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  const { data, error } = await supabase
    .from(MIGRATIONS_TABLE)
    .select('migration_name')
    .order('id', { ascending: true })

  if (error) {
    console.error('Failed to fetch applied migrations:', error)
    return []
  }

  return data.map((row: any) => row.migration_name)
}

/**
 * Get list of available migration files
 */
function getAvailableMigrations(): string[] {
  const migrationsDir = path.join(__dirname, 'migrations')
  const files = fs.readdirSync(migrationsDir)

  return files
    .filter((file) => file.endsWith('.sql'))
    .sort()
}

/**
 * Apply a single migration
 */
async function applyMigration(migrationName: string): Promise<boolean> {
  const migrationsDir = path.join(__dirname, 'migrations')
  const migrationPath = path.join(migrationsDir, migrationName)

  console.log(`📝 Applying migration: ${migrationName}`)

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Note: Supabase doesn't support direct SQL execution via the JS client
    // This is a limitation - migrations should be run via Supabase SQL Editor
    console.log('⚠️  Direct migration execution not supported via Supabase JS client')
    console.log('📋 Please run this migration manually in Supabase SQL Editor:')
    console.log(`   File: ${migrationPath}`)
    console.log('')
    console.log('Steps:')
    console.log('1. Go to your Supabase project')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Click "New Query"')
    console.log('4. Copy and paste the migration SQL')
    console.log('5. Click "Run"')
    console.log('')

    return false
  } catch (error) {
    console.error(`❌ Failed to read migration file:`, error)
    return false
  }
}

/**
 * Record migration as applied
 */
async function recordMigration(migrationName: string) {
  const { error } = await supabase
    .from(MIGRATIONS_TABLE)
    .insert([{ migration_name: migrationName }] as any)

  if (error) {
    console.error('Failed to record migration:', error)
    throw error
  }
}

/**
 * Show migration status
 */
async function showStatus() {
  console.log('📊 Migration Status\n')

  const applied = await getAppliedMigrations()
  const available = getAvailableMigrations()

  console.log(`Applied: ${applied.length}`)
  console.log(`Available: ${available.length}`)
  console.log(`Pending: ${available.length - applied.length}\n`)

  if (applied.length > 0) {
    console.log('✅ Applied migrations:')
    applied.forEach((name) => console.log(`   - ${name}`))
    console.log('')
  }

  const pending = available.filter((name) => !applied.includes(name))
  if (pending.length > 0) {
    console.log('⏳ Pending migrations:')
    pending.forEach((name) => console.log(`   - ${name}`))
    console.log('')
  }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
  console.log('🚀 Running database migrations\n')

  const applied = await getAppliedMigrations()
  const available = getAvailableMigrations()
  const pending = available.filter((name) => !applied.includes(name))

  if (pending.length === 0) {
    console.log('✅ All migrations already applied!')
    return
  }

  console.log(`Found ${pending.length} pending migration(s)\n`)

  for (const migrationName of pending) {
    await applyMigration(migrationName)
  }

  console.log('\n📌 Note: Migrations must be run manually via Supabase SQL Editor')
  console.log('After running migrations, you can use this script to track which ones are applied.')
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2] || 'run'

  try {
    // Test database connection
    const { error: connError } = await supabase.from('users').select('count').limit(1)
    if (connError && !connError.message.includes('does not exist')) {
      console.error('❌ Database connection failed')
      console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env')
      process.exit(1)
    }

    switch (command) {
      case 'status':
        await showStatus()
        break
      case 'run':
      default:
        await runMigrations()
        break
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { runMigrations, showStatus, getAvailableMigrations, getAppliedMigrations }
