# Boxing Coach Backend API

Express.js backend API for the Boxing Coach application with Supabase PostgreSQL database.

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account (free tier available at supabase.com)

## Setup Instructions

### 1. Install Dependencies

```bash
cd BoxingCoach-Backend
npm install
```

### 2. Configure Supabase

Follow the instructions in `SUPABASE_SETUP.md` to:

- Create a Supabase project
- Set up database tables
- Get your API credentials

### 3. Create Environment File

Create `.env` file in the project root:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-change-in-production
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,https://boxing-coach.vercel.app
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5001`

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh token (coming soon)

### Users

- `GET /api/v1/users/profile` - Get user profile (requires auth)
- `PUT /api/v1/users/profile` - Update user profile (requires auth)
- `GET /api/v1/users/stats` - Get user statistics (requires auth)

### Training

- `POST /api/v1/training/sessions` - Record training session (requires auth)
- `GET /api/v1/training/sessions` - Get user's training history (requires auth)
- `GET /api/v1/training/sessions/:id` - Get specific session (requires auth)
- `GET /api/v1/training/stats` - Get training statistics (requires auth)

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

Tokens are valid for 7 days.

## Database Schema

### users

- `id` - UUID primary key
- `email` - Unique email address
- `password_hash` - Hashed password
- `full_name` - User's name
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

### training_sessions

- `id` - UUID primary key
- `user_id` - Foreign key to users
- `technique` - Boxing technique (Jab, Cross, Hook, etc)
- `duration_seconds` - Session duration
- `score` - Performance score
- `velocity` - Punch velocity
- `accuracy` - Accuracy percentage
- `created_at` - Session timestamp

### user_stats

- `id` - UUID primary key
- `user_id` - Foreign key to users
- `total_sessions` - Number of training sessions
- `total_training_time` - Total training time in seconds
- `average_score` - Average performance score
- `best_score` - Best performance score
- `updated_at` - Last update timestamp

## Example Requests

### Sign Up

```bash
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "fullName": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### Get User Profile

```bash
curl -X GET http://localhost:5001/api/v1/users/profile \
  -H "Authorization: Bearer your_token_here"
```

### Record Training Session

```bash
curl -X POST http://localhost:5001/api/v1/training/sessions \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "technique": "Jab",
    "durationSeconds": 180,
    "score": 85.5,
    "velocity": 12.3,
    "accuracy": 92.0
  }'
```

## Deployment

### Deploy to Railway (Recommended)

1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

### Deploy to Heroku

```bash
heroku create boxing-coach-backend
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_SERVICE_ROLE_KEY=...
heroku config:set JWT_SECRET=...
git push heroku main
```

## Security Considerations

⚠️ **Important:**

- Never commit `.env` file to git
- Use strong JWT_SECRET in production
- Enable HTTPS in production
- Use environment variables for all secrets
- Implement rate limiting for production
- Add request validation for all inputs
- Use HTTPS for all API calls

## Testing

```bash
npm test
```

## Troubleshooting

### Connection Issues

- Verify Supabase URL is correct
- Check that service role key is valid
- Ensure CORS settings are correct

### Authentication Errors

- Verify JWT_SECRET is consistent
- Check token expiration
- Ensure Authorization header format is correct

### Database Errors

- Check that all tables are created
- Verify RLS policies are configured
- Check user permissions

## Performance Tips

- Use pagination for large datasets
- Index frequently queried columns (done in setup)
- Cache user stats when possible
- Use connection pooling for production

## Contributing

Please follow the existing code structure and add tests for new features.

## License

MIT
