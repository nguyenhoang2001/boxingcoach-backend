# Complete Setup Guide: Supabase + Express Backend + React Frontend

## Overview

This guide walks you through setting up the complete Boxing Coach application with:

- **Frontend:** React on Vercel (existing)
- **Backend:** Express.js API
- **Database:** Supabase (PostgreSQL)

---

## Part 1: Supabase Setup (5-10 minutes)

### 1.1 Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create new project:
   - **Name:** `boxing-coach`
   - **Password:** Create strong password (save it!)
   - **Region:** Pick closest to your location
5. Wait ~2 minutes for project to initialize

### 1.2 Get API Keys

1. In Supabase dashboard, click ⚙️ (Settings icon)
2. Click "API" in left sidebar
3. Copy and save these values:
   ```
   Project URL: https://xxxxxxxx.supabase.co
   Anon Public Key: eyJxxxx...
   Service Role Key: eyJxxxx... (KEEP SECRET!)
   ```

### 1.3 Create Database Tables

1. In Supabase, click "SQL Editor"
2. Click "New Query"
3. Copy SQL from `SUPABASE_SETUP.md` file
4. Paste and click "Run"
5. Verify tables created ✅

---

## Part 2: Backend Setup (15-20 minutes)

### 2.1 Create Backend Project

```bash
# Navigate to your projects folder
cd ~/Documents/projects

# Create backend directory
mkdir BoxingCoach-Backend
cd BoxingCoach-Backend

# Initialize npm
npm init -y
```

### 2.2 Install Dependencies

```bash
npm install express cors dotenv supabase bcryptjs jsonwebtoken uuid
npm install --save-dev typescript @types/express @types/node ts-node
```

### 2.3 Copy Backend Files

Copy these files from the structure I created:

- `src/index.ts` - Main server file
- `src/utils/auth.ts` - Authentication utilities
- `src/routes/auth.ts` - Authentication endpoints
- `src/routes/users.ts` - User profile endpoints
- `src/routes/training.ts` - Training data endpoints
- `tsconfig.json` - TypeScript config
- `package.json` - Dependencies (use my version)

### 2.4 Create Environment File

Create `.env` file:

```env
SUPABASE_URL=https://your-xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxx...
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,https://boxing-coach.vercel.app
```

### 2.5 Test Backend Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

You should see:

```
✅ Server running on http://localhost:5001
📚 API Documentation: http://localhost:5001/api/v1
🏥 Health check: http://localhost:5001/health
```

Test health endpoint:

```bash
curl http://localhost:5001/health
```

---

## Part 3: Connect React Frontend (20-30 minutes)

### 3.1 Install Supabase Client

In your React project (`BoxingCoach`):

```bash
npm install @supabase/supabase-js
```

### 3.2 Create API Service

Create `src/services/api.ts`:

```typescript
import axios, { AxiosInstance } from "axios";

const API_URL = process.env.VITE_API_URL || "http://localhost:5001/api/v1";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  signup: (email: string, password: string, fullName: string) =>
    api.post("/auth/signup", { email, password, fullName }),

  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (fullName: string) => api.put("/users/profile", { fullName }),
  getStats: () => api.get("/users/stats"),
};

// Training API calls
export const trainingAPI = {
  recordSession: (
    technique: string,
    durationSeconds: number,
    score: number,
    velocity: number,
    accuracy: number,
  ) =>
    api.post("/training/sessions", {
      technique,
      durationSeconds,
      score,
      velocity,
      accuracy,
    }),

  getSessions: (limit: number = 20, offset: number = 0) =>
    api.get("/training/sessions", { params: { limit, offset } }),

  getStats: () => api.get("/training/stats"),
};

export default api;
```

### 3.3 Update Auth Component

Update `src/pages/auth/Auth.tsx` to use real backend:

```typescript
const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  try {
    const response = await authAPI.signup(email, password, fullName);
    localStorage.setItem("authToken", response.data.token);
    // Redirect to home
  } catch (error) {
    console.error("Signup failed:", error);
  }
};
```

### 3.4 Environment Variables

Create `.env.local` in React project:

```
VITE_API_URL=http://localhost:5001/api/v1
VITE_SUPABASE_URL=https://your-xxxxxxxx.supabase.co
```

For production (Vercel):

```
VITE_API_URL=https://your-backend-url.com/api/v1
```

---

## Part 4: Deployment (30-45 minutes)

### 4.1 Deploy Backend to Railway

Recommended: Use Railway.app (super easy!)

1. Go to https://railway.app
2. Connect GitHub account
3. Select `BoxingCoach-Backend` repository
4. Add environment variables
5. Deploy automatically

**Or use Heroku:**

```bash
heroku create boxing-coach-api
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_SERVICE_ROLE_KEY=...
heroku config:set JWT_SECRET=... (new strong secret)
git push heroku main
```

### 4.2 Deploy Frontend Updates

In Vercel dashboard:

1. Update environment variable: `VITE_API_URL` to your deployed backend URL
2. Push changes to GitHub
3. Vercel auto-deploys

---

## Part 5: Testing

### Test Signup Flow

```bash
# 1. Start backend
npm run dev

# 2. In another terminal, test signup
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Response:
{
  "message": "User created successfully",
  "token": "eyJ...",
  "user": { "id": "...", "email": "test@example.com" }
}
```

### Test Profile Endpoint

```bash
# Replace TOKEN with token from signup response
curl -X GET http://localhost:5001/api/v1/users/profile \
  -H "Authorization: Bearer TOKEN"
```

### Test Training Session

```bash
curl -X POST http://localhost:5001/api/v1/training/sessions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "technique": "Jab",
    "durationSeconds": 180,
    "score": 85.5,
    "velocity": 12.3,
    "accuracy": 92.0
  }'
```

---

## Troubleshooting

### Backend won't start

- Check `.env` file exists
- Verify `SUPABASE_URL` is correct
- Try: `npm install` again

### Frontend can't connect to backend

- Check `VITE_API_URL` is correct
- Make sure backend is running
- Check CORS settings (should be configured)

### Database errors

- Verify tables were created in Supabase
- Check that SQL ran without errors
- Try running SQL again

### Authentication failing

- Check token in localStorage
- Verify JWT_SECRET is same on backend
- Check token isn't expired

---

## Next Steps

After setup, you can:

1. ✅ Connect login/signup form to real database
2. ✅ Save training sessions automatically
3. ✅ Create user dashboard showing stats
4. ✅ Add progress tracking charts
5. ✅ Implement leaderboard

---

## Security Checklist

- [ ] Never commit `.env` to git
- [ ] Use strong `JWT_SECRET` in production
- [ ] Enable HTTPS for all API calls
- [ ] Set `NODE_ENV=production` on deployed backend
- [ ] Use unique `SUPABASE_SERVICE_ROLE_KEY` for backend only
- [ ] Implement rate limiting on production
- [ ] Add input validation on all endpoints
- [ ] Monitor logs for errors

---

## Support

If you get stuck:

1. Check the README.md in BoxingCoach-Backend
2. Verify SUPABASE_SETUP.md was followed
3. Check .env files are correct
4. Look at console errors (backend logs and browser console)
5. Try the curl examples above

Good luck! 🥊
