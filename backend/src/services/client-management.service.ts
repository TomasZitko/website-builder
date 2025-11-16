/**
 * Client Management Service
 *
 * B2B2C functionality - Developers manage their clients
 */

import { supabase } from '../db/supabase';
import crypto from 'crypto';
import { sendEmail } from './email.service';
import {
  Client,
  ClientWebsite,
  DeveloperStats,
  CreateClientRequest,
  InviteClientRequest
} from '../types/b2b2c';

/**
 * Create a new client for a developer
 */
export async function createClient(
  developerId: string,
  clientData: CreateClientRequest
): Promise<Client> {
  // Check if developer can add more clients (plan limits)
  const { data: canAdd } = await supabase.rpc('can_add_client', {
    dev_id: developerId
  });

  if (!canAdd) {
    throw new Error('Client limit reached for your plan. Please upgrade to add more clients.');
  }

  // Insert client
  const { data, error } = await supabase
    .from('clients')
    .insert({
      developer_id: developerId,
      client_name: clientData.client_name,
      client_email: clientData.client_email,
      client_company: clientData.client_company,
      client_phone: clientData.client_phone,
      monthly_fee: clientData.monthly_fee,
      billing_cycle: clientData.billing_cycle || 'monthly',
      notes: clientData.notes,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  console.log(`✅ Client created: ${data.client_name} (${data.id})`);
  return data as Client;
}

/**
 * Send invitation email to client
 */
export async function inviteClient(
  clientId: string,
  request: InviteClientRequest
): Promise<void> {
  // Generate unique invitation token
  const token = crypto.randomBytes(32).toString('hex');

  // Update client with invitation token
  const { data: client, error: updateError } = await supabase
    .from('clients')
    .update({
      invitation_token: token,
      invitation_sent_at: new Date().toISOString(),
      access_level: request.access_level || 'view'
    })
    .eq('id', clientId)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  // Get developer info
  const { data: developer } = await supabase
    .from('users')
    .select('first_name, last_name, agency_name, email')
    .eq('id', (client as any).developer_id)
    .single();

  const developerName = developer?.agency_name ||
    `${developer?.first_name || ''} ${developer?.last_name || ''}`.trim() ||
    'Your Web Developer';

  // Send invitation email
  const invitationUrl = `${process.env.FRONTEND_URL}/client/accept-invitation?token=${token}`;

  await sendEmail({
    to: (client as any).client_email,
    subject: `${developerName} invited you to collaborate on your website`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've been invited!</h2>
        <p>Hi ${(client as any).client_name},</p>
        <p>${developerName} has invited you to collaborate on your website project through WebChat.ai.</p>
        <p>With your account, you'll be able to:</p>
        <ul>
          <li>View your website's progress in real-time</li>
          <li>Chat directly with the AI to request changes</li>
          <li>Provide feedback and approvals</li>
          <li>Access your website analytics</li>
        </ul>
        <p style="margin: 30px 0;">
          <a href="${invitationUrl}"
             style="background: #6366F1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This invitation will expire in 7 days.
        </p>
      </div>
    `
  });

  console.log(`📧 Invitation sent to ${(client as any).client_email}`);
}

/**
 * Accept client invitation
 */
export async function acceptClientInvitation(
  token: string,
  userId: string
): Promise<Client> {
  // Find client by token
  const { data: client, error: findError } = await supabase
    .from('clients')
    .select('*')
    .eq('invitation_token', token)
    .single();

  if (findError || !client) {
    throw new Error('Invalid or expired invitation token');
  }

  // Check if invitation is still valid (7 days)
  const invitationDate = new Date(client.invitation_sent_at);
  const now = new Date();
  const daysDiff = (now.getTime() - invitationDate.getTime()) / (1000 * 3600 * 24);

  if (daysDiff > 7) {
    throw new Error('Invitation has expired');
  }

  // Update client with user ID
  const { data: updatedClient, error: updateError } = await supabase
    .from('clients')
    .update({
      client_user_id: userId,
      status: 'active',
      invitation_accepted_at: new Date().toISOString(),
      invitation_token: null // Clear token after use
    })
    .eq('id', client.id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  console.log(`✅ Client invitation accepted: ${client.client_name}`);
  return updatedClient as Client;
}

/**
 * Get all clients for a developer
 */
export async function getDeveloperClients(developerId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('developer_id', developerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data as Client[];
}

/**
 * Get client by ID
 */
export async function getClientById(clientId: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (error) {
    throw error;
  }

  return data as Client;
}

/**
 * Update client
 */
export async function updateClient(
  clientId: string,
  updates: Partial<Client>
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', clientId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Client;
}

/**
 * Delete client (and all associated websites)
 */
export async function deleteClient(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId);

  if (error) {
    throw error;
  }

  console.log(`🗑️ Client deleted: ${clientId}`);
}

/**
 * Link website to client
 */
export async function linkWebsiteToClient(
  clientId: string,
  websiteId: string,
  developerId: string,
  projectDetails?: {
    project_name?: string;
    quoted_price?: number;
    estimated_completion?: Date;
  }
): Promise<ClientWebsite> {
  const { data, error } = await supabase
    .from('client_websites')
    .insert({
      client_id: clientId,
      website_id: websiteId,
      developer_id: developerId,
      project_name: projectDetails?.project_name,
      quoted_price: projectDetails?.quoted_price,
      estimated_completion: projectDetails?.estimated_completion,
      project_status: 'in_progress'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Send notification to client
  const { data: client } = await supabase
    .from('clients')
    .select('client_email, client_name')
    .eq('id', clientId)
    .single();

  if (client) {
    await sendEmail({
      to: client.client_email,
      subject: 'Your website project has started!',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Great news, ${client.client_name}!</h2>
          <p>Your website project "${projectDetails?.project_name || 'New Website'}" has officially started.</p>
          <p>You can track progress and view your website in real-time through your dashboard.</p>
          <p><a href="${process.env.FRONTEND_URL}/dashboard" style="color: #6366F1;">View Project →</a></p>
        </div>
      `
    });
  }

  return data as ClientWebsite;
}

/**
 * Get client's websites
 */
export async function getClientWebsites(clientId: string): Promise<ClientWebsite[]> {
  const { data, error } = await supabase
    .from('client_websites')
    .select(`
      *,
      website:websites(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as any[];
}

/**
 * Update client website project status
 */
export async function updateClientWebsiteStatus(
  clientWebsiteId: string,
  status: 'in_progress' | 'review' | 'completed' | 'maintenance',
  paymentStatus?: 'unpaid' | 'partial' | 'paid'
): Promise<ClientWebsite> {
  const updates: any = { project_status: status };

  if (paymentStatus) {
    updates.payment_status = paymentStatus;
  }

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('client_websites')
    .update(updates)
    .eq('id', clientWebsiteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ClientWebsite;
}

/**
 * Get developer statistics
 */
export async function getDeveloperStats(developerId: string): Promise<DeveloperStats> {
  const { data, error } = await supabase.rpc('get_developer_stats', {
    dev_id: developerId
  });

  if (error) {
    throw error;
  }

  return data[0] as DeveloperStats;
}

/**
 * Track revenue for client
 */
export async function recordClientRevenue(
  clientId: string,
  amount: number,
  description: string
): Promise<void> {
  // Update client's total revenue
  const { data: client } = await supabase
    .from('clients')
    .select('total_revenue')
    .eq('id', clientId)
    .single();

  const newTotal = (client?.total_revenue || 0) + amount;

  await supabase
    .from('clients')
    .update({ total_revenue: newTotal })
    .eq('id', clientId);

  console.log(`💰 Revenue recorded: $${amount} for client ${clientId}`);
}

/**
 * Get clients by status
 */
export async function getClientsByStatus(
  developerId: string,
  status: 'active' | 'inactive' | 'pending'
): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('developer_id', developerId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data as Client[];
}
