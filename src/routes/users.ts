import express, { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken, AuthenticatedRequest, errorResponse, successResponse } from '../utils/auth';

const router: Router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/v1/users/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, { user });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch profile');
  }
});

/**
 * PUT /api/v1/users/profile
 * Update user profile
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const { fullName } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({ full_name: fullName })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error || !user) {
      return errorResponse(res, 400, 'Failed to update profile');
    }

    return successResponse(res, {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return errorResponse(res, 500, error.message || 'Failed to update profile');
  }
});

/**
 * GET /api/v1/users/stats
 * Get user statistics
 */
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error || !stats) {
      return errorResponse(res, 404, 'User stats not found');
    }

    return successResponse(res, { stats });

  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch stats');
  }
});

export default router;
