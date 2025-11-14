import { Request, Response } from 'express';
import * as oauthService from '../services/oauth.service';
import { env } from '../config/env';

export async function googleAuth(req: Request, res: Response) {
  try {
    const authUrl = oauthService.getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({
      error: 'OAuth failed',
      message: error.message
    });
  }
}

export async function googleCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Get user info from Google
    const googleUser = await oauthService.getGoogleUser(code);

    // Create or login user
    const result = await oauthService.handleGoogleAuth(googleUser);

    // Redirect to frontend with tokens
    const redirectUrl = `${env.FRONTEND_URL}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}

export async function githubAuth(req: Request, res: Response) {
  try {
    const authUrl = oauthService.getGitHubAuthUrl();
    res.redirect(authUrl);
  } catch (error: any) {
    res.status(500).json({
      error: 'OAuth failed',
      message: error.message
    });
  }
}

export async function githubCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;

    if (!code) {
      return res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
    }

    // Get user info from GitHub
    const githubUser = await oauthService.getGitHubUser(code);

    // Create or login user
    const result = await oauthService.handleGitHubAuth(githubUser);

    // Redirect to frontend with tokens
    const redirectUrl = `${env.FRONTEND_URL}/auth/callback?token=${result.token}&refreshToken=${result.refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${env.FRONTEND_URL}/login?error=oauth_failed`);
  }
}
