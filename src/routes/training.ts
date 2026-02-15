import express, { Router, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken, AuthenticatedRequest, errorResponse, successResponse } from '../utils/auth';

const router: Router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * POST /api/v1/training/sessions
 * Record a new training session
 */
router.post('/sessions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const { technique, durationSeconds, score, velocity, accuracy } = req.body;

    // Validation
    if (!technique || durationSeconds === undefined) {
      return errorResponse(res, 400, 'Technique and duration are required');
    }

    // Create training session
    const { data: session, error } = await supabase
      .from('training_sessions')
      .insert([
        {
          user_id: req.user.id,
          technique,
          duration_seconds: durationSeconds,
          score: score || 0,
          velocity: velocity || 0,
          accuracy: accuracy || 0
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update user stats
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (currentStats) {
      await supabase
        .from('user_stats')
        .update({
          total_sessions: (currentStats.total_sessions || 0) + 1,
          total_training_time: (currentStats.total_training_time || 0) + durationSeconds,
          average_score: calculateAverage(currentStats.average_score, score, (currentStats.total_sessions || 0) + 1),
          best_score: score > (currentStats.best_score || 0) ? score : currentStats.best_score
        })
        .eq('user_id', req.user.id);
    }

    return successResponse(res, {
      message: 'Training session recorded',
      session
    }, 201);

  } catch (error: any) {
    console.error('Session record error:', error);
    return errorResponse(res, 500, error.message || 'Failed to record session');
  }
});

/**
 * GET /api/v1/training/sessions
 * Get user's training sessions
 */
router.get('/sessions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data: sessions, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return successResponse(res, {
      sessions,
      pagination: { limit, offset }
    });

  } catch (error: any) {
    console.error('Sessions fetch error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch sessions');
  }
});

/**
 * GET /api/v1/training/sessions/:id
 * Get specific training session
 */
router.get('/sessions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    const { data: session, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !session) {
      return errorResponse(res, 404, 'Session not found');
    }

    return successResponse(res, { session });

  } catch (error: any) {
    console.error('Session fetch error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch session');
  }
});

/**
 * GET /api/v1/training/stats
 * Get training statistics
 */
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized');
    }

    // Get user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    // Get technique breakdown
    const { data: techniqueStats } = await supabase
      .rpc('get_technique_stats', { user_id_param: req.user.id });

    return successResponse(res, {
      overall: stats,
      byTechnique: techniqueStats || []
    });

  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch stats');
  }
});

/**
 * Helper function to calculate running average
 */
const calculateAverage = (currentAvg: number, newValue: number, totalCount: number): number => {
  return ((currentAvg * (totalCount - 1)) + newValue) / totalCount;
};

export default router;
