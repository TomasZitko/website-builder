import { supabase, User } from '../db/supabase';
import { hashPassword, verifyPassword } from '../utils/hash';
import { generateToken, generateVerificationToken, generateResetToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';

export async function register(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.email)
    .single();

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(data.password);

  // Generate verification token
  const verificationToken = generateVerificationToken();

  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: data.email,
      password_hash: passwordHash,
      first_name: data.firstName,
      last_name: data.lastName,
      email_verified: false,
      email_verification_token: verificationToken
    } as any)
    .select()
    .single();

  if (error) throw error;
  if (!user) throw new Error('Failed to create user');

  // Send verification email
  await sendVerificationEmail(data.email, verificationToken);

  const typedUser = user as any as User;
  return {
    user: {
      id: typedUser.id,
      email: typedUser.email,
      firstName: typedUser.first_name,
      lastName: typedUser.last_name
    },
    message: 'Registration successful. Please check your email to verify your account.'
  };
}

export async function login(email: string, password: string) {
  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Invalid email or password');
  }

  const typedUser = user as any as User;

  // Verify password
  const isValid = await verifyPassword(password, typedUser.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Check email verified (skip in development)
  if (process.env.NODE_ENV === 'production' && !typedUser.email_verified) {
    throw new Error('Please verify your email before logging in');
  }

  // Update last login
  await supabase
    .from('users')
    // @ts-ignore - Supabase type issue
    .update({ last_login: new Date().toISOString() })
    .eq('id', typedUser.id);

  // Generate tokens
  const tokenPayload = {
    userId: typedUser.id,
    email: typedUser.email
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: typedUser.id,
      email: typedUser.email,
      firstName: typedUser.first_name,
      lastName: typedUser.last_name,
      subscriptionTier: typedUser.subscription_tier
    },
    token: accessToken,
    refreshToken,
    expiresIn: 86400 // 1 day in seconds
  };
}

export async function verifyEmail(token: string) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('email_verification_token', token)
    .single();

  if (!user) {
    throw new Error('Invalid verification token');
  }

  const typedUser = user as any as User;

  await supabase
    .from('users')
    // @ts-ignore - Supabase type issue
    .update({
      email_verified: true,
      email_verification_token: null
    })
    .eq('id', typedUser.id);

  return { message: 'Email verified successfully' };
}

export async function forgotPassword(email: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!user) {
    // Don't reveal if email exists
    return { message: 'If that email exists, a reset link has been sent' };
  }

  const typedUser = user as any as User;
  const resetToken = generateResetToken();

  await supabase
    .from('users')
    // @ts-ignore - Supabase type issue
    .update({
      password_reset_token: resetToken,
      password_reset_expires: new Date(Date.now() + 3600000).toISOString() // 1 hour
    })
    .eq('id', typedUser.id);

  await sendPasswordResetEmail(email, resetToken);

  return { message: 'If that email exists, a reset link has been sent' };
}

export async function resetPassword(token: string, newPassword: string) {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('password_reset_token', token)
    .single();

  if (!user) {
    throw new Error('Invalid or expired reset token');
  }

  const typedUser = user as any as User;

  if (typedUser.password_reset_expires && new Date(typedUser.password_reset_expires) < new Date()) {
    throw new Error('Reset token has expired');
  }

  const passwordHash = await hashPassword(newPassword);

  await supabase
    .from('users')
    // @ts-ignore - Supabase type issue
    .update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null
    })
    .eq('id', typedUser.id);

  return { message: 'Password reset successfully' };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  const typedUser = user as any as User;

  // Verify current password
  const isValid = await verifyPassword(currentPassword, typedUser.password_hash);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password
  await supabase
    .from('users')
    // @ts-ignore - Supabase type issue
    .update({ password_hash: passwordHash })
    .eq('id', userId);

  return { message: 'Password changed successfully' };
}

export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);

  // Get user to ensure they still exist
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, subscription_tier')
    .eq('id', payload.userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  const typedUser = user as any as User;

  // Generate new access token
  const newAccessToken = generateToken({
    userId: typedUser.id,
    email: typedUser.email
  });

  return {
    token: newAccessToken,
    expiresIn: 86400
  };
}

// TODO: PRODUCTION - Implement token blacklisting with Redis
// See: TO-DO-PRODUCTION.md > Performance & Monitoring > Implement Redis for Token Blacklist
export async function logout(userId: string) {
  // Update last logout time (optional)
  await supabase
    .from('users')
    // @ts-ignore - Supabase type issue
    .update({ updated_at: new Date().toISOString() })
    .eq('id', userId);

  // In production, add token to Redis blacklist here
  // For now, client-side token deletion is sufficient

  return { message: 'Logged out successfully' };
}

export async function deleteAccount(userId: string, password: string) {
  // Get user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  const typedUser = user as any as User;

  // Verify password before deletion
  const isValid = await verifyPassword(password, typedUser.password_hash);
  if (!isValid) {
    throw new Error('Password is incorrect');
  }

  // TODO: PRODUCTION - Implement soft delete with grace period
  // See: TO-DO-PRODUCTION.md > UX Improvements > Account Deletion with Grace Period

  // Delete user (cascading deletes should handle related data)
  await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  return { message: 'Account deleted successfully' };
}
