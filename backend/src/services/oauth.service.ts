import axios from 'axios';
import { supabase, User } from '../db/supabase';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

interface GitHubUserInfo {
  id: number;
  login: string;
  email: string | null;
  name: string | null;
  avatar_url: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = env.API_URL + '/api/v1/auth/google/callback';

const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET || '';
const GITHUB_REDIRECT_URI = env.API_URL + '/api/v1/auth/github/callback';

export function getGoogleAuthUrl(): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: GOOGLE_REDIRECT_URI,
    client_id: GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ')
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function getGoogleUser(code: string): Promise<GoogleUserInfo> {
  // Exchange code for tokens
  const tokenResponse = await axios.post<GoogleTokenResponse>(
    'https://oauth2.googleapis.com/token',
    {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
  );

  const { access_token, id_token } = tokenResponse.data;

  // Get user info
  const userResponse = await axios.get<GoogleUserInfo>(
    'https://www.googleapis.com/oauth2/v1/userinfo',
    {
      headers: { Authorization: `Bearer ${access_token}` }
    }
  );

  return userResponse.data;
}

export async function handleGoogleAuth(googleUser: GoogleUserInfo) {
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', googleUser.email)
    .single();

  let user: User;

  if (existingUser) {
    // User exists, update last login
    const typedUser = existingUser as any as User;
    await supabase
      .from('users')
      // @ts-ignore - Supabase type issue
      .update({ last_login: new Date().toISOString() })
      .eq('id', typedUser.id);
    user = typedUser;
  } else {
    // Create new user (OAuth users have no password, email is verified)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: googleUser.email,
        password_hash: '', // No password for OAuth users
        first_name: googleUser.given_name,
        last_name: googleUser.family_name,
        email_verified: true, // Google verifies emails
        email_verification_token: null
      } as any)
      .select()
      .single();

    if (error) throw error;
    if (!newUser) throw new Error('Failed to create user');

    user = newUser as any as User;
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      subscriptionTier: user.subscription_tier
    },
    token: accessToken,
    refreshToken,
    expiresIn: 86400
  };
}

export function getGitHubAuthUrl(): string {
  const rootUrl = 'https://github.com/login/oauth/authorize';
  const options = {
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'read:user user:email'
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function getGitHubUser(code: string): Promise<GitHubUserInfo> {
  // Exchange code for access token
  const tokenResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI
    },
    {
      headers: { Accept: 'application/json' }
    }
  );

  const accessToken = tokenResponse.data.access_token;

  // Get user info
  const userResponse = await axios.get<GitHubUserInfo>(
    'https://api.github.com/user',
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const user = userResponse.data;

  // If email is not public, fetch from emails endpoint
  if (!user.email) {
    const emailsResponse = await axios.get<GitHubEmail[]>(
      'https://api.github.com/user/emails',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const primaryEmail = emailsResponse.data.find(e => e.primary && e.verified);
    if (primaryEmail) {
      user.email = primaryEmail.email;
    }
  }

  if (!user.email) {
    throw new Error('GitHub account does not have a verified email');
  }

  return user;
}

export async function handleGitHubAuth(githubUser: GitHubUserInfo) {
  if (!githubUser.email) {
    throw new Error('GitHub account does not have a verified email');
  }

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('email', githubUser.email)
    .single();

  let user: User;

  if (existingUser) {
    // User exists, update last login
    const typedUser = existingUser as any as User;
    await supabase
      .from('users')
      // @ts-ignore - Supabase type issue
      .update({ last_login: new Date().toISOString() })
      .eq('id', typedUser.id);
    user = typedUser;
  } else {
    // Parse name from GitHub (might be null)
    const nameParts = (githubUser.name || githubUser.login).split(' ');
    const firstName = nameParts[0] || githubUser.login;
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: githubUser.email,
        password_hash: '', // No password for OAuth users
        first_name: firstName,
        last_name: lastName,
        email_verified: true, // GitHub verifies emails
        email_verification_token: null
      } as any)
      .select()
      .single();

    if (error) throw error;
    if (!newUser) throw new Error('Failed to create user');

    user = newUser as any as User;
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email
  };

  const accessToken = generateToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      subscriptionTier: user.subscription_tier
    },
    token: accessToken,
    refreshToken,
    expiresIn: 86400
  };
}
