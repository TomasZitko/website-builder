/**
 * AGENCY PLATFORM MIDDLEWARE
 * Middleware for checking agency permissions and ownership
 */

import { Request, Response, NextFunction } from 'express';
import { getUserById } from '../db/helpers';
import { getAgencyByOwnerId, userOwnsAgency, agencyOwnsClient, agencyOwnsProject } from '../db/agency.helpers';

// Extend Express Request type to include agency data
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      accountType?: 'personal' | 'agency';
      agencyId?: string;
    }
  }
}

/**
 * Middleware to check if user has an agency account
 * Must be used AFTER authenticateToken middleware
 */
export async function requireAgencyAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in'
      });
    }

    // Get user's account type
    const user = await getUserById(req.userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account does not exist'
      });
    }

    if (user.account_type !== 'agency') {
      return res.status(403).json({
        error: 'Agency account required',
        message: 'This endpoint requires an agency account. Please upgrade your account.'
      });
    }

    // Get the user's agency
    const agency = await getAgencyByOwnerId(req.userId);

    if (!agency) {
      return res.status(404).json({
        error: 'Agency not found',
        message: 'No agency found for this account'
      });
    }

    // Attach agency info to request
    req.accountType = 'agency';
    req.agencyId = agency.id;

    next();
  } catch (error) {
    console.error('Error in requireAgencyAccount middleware:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify agency account'
    });
  }
}

/**
 * Middleware to check if agency owns the specified client
 * Expects req.params.clientId to be present
 */
export async function requireClientOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Client ID is required'
      });
    }

    if (!req.agencyId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Agency ID not found'
      });
    }

    const owns = await agencyOwnsClient(req.agencyId, clientId);

    if (!owns) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this client'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireClientOwnership middleware:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify client ownership'
    });
  }
}

/**
 * Middleware to check if agency owns the specified project
 * Expects req.params.projectId to be present
 */
export async function requireProjectOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Project ID is required'
      });
    }

    if (!req.agencyId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Agency ID not found'
      });
    }

    const owns = await agencyOwnsProject(req.agencyId, projectId);

    if (!owns) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this project'
      });
    }

    next();
  } catch (error) {
    console.error('Error in requireProjectOwnership middleware:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to verify project ownership'
    });
  }
}

/**
 * Middleware to optionally attach agency data (doesn't block if user is personal account)
 * Useful for endpoints that work for both personal and agency users
 */
export async function attachAgencyData(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return next();
    }

    const user = await getUserById(req.userId);

    if (user && user.account_type === 'agency') {
      const agency = await getAgencyByOwnerId(req.userId);

      if (agency) {
        req.accountType = 'agency';
        req.agencyId = agency.id;
      }
    } else {
      req.accountType = 'personal';
    }

    next();
  } catch (error) {
    // Don't block the request, just log the error
    console.error('Error in attachAgencyData middleware:', error);
    next();
  }
}
