import express, { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, comparePassword, generateToken, errorResponse, successResponse } from '../utils/auth';

const router: Router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Handle OPTIONS requests for CORS preflight
router.options('*', (req: Request, res: Response) => {
  res.status(200).end();
});

// Test endpoint to verify routing
router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Auth routes are working', timestamp: new Date().toISOString() });
});

/**
 * POST /api/v1/auth/signup
 * Register a new user
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: passwordHash,
          full_name: fullName || email.split('@')[0]
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return errorResponse(res, 409, 'Email already exists');
      }
      throw error;
    }

    // Create user stats record
    await supabase
      .from('user_stats')
      .insert([{ user_id: user.id }]);

    // Generate token
    const token = generateToken(user.id, user.email);

    return successResponse(res, {
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    }, 201);

  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(res, 500, error.message || 'Signup failed');
  }
});

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Compare passwords
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    return successResponse(res, {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(res, 500, error.message || 'Login failed');
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh token (placeholder)
 */
router.post('/refresh', (req: Request, res: Response) => {
  // Token refresh logic here
  return errorResponse(res, 501, 'Token refresh not implemented yet');
});

export default router;
