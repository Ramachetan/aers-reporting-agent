# Supabase Authentication Setup Guide

## Prerequisites
You mentioned you have a free Supabase instance. Follow these steps to complete the setup:

## 1. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Public anon key** (starts with `eyJ...`)

## 2. Update Environment Variables

Replace the placeholder values in your `.env` file:

```env
GEMINI_API_KEY="AIzaSyBS7cH9ntFqW38cfuMcEQ00sp5N1qATa1I"
PG_PASSWORD="Ap31cp5767*"

# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 3. Configure Authentication Providers (Optional)

If you want to enable Google/GitHub sign-in:

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable the providers you want (Google, GitHub, etc.)
3. Follow the provider-specific setup instructions

## 4. Set Up Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL: `http://localhost:5173` (for development)
3. For production, add your deployed URL

## 5. Database Setup (Optional)

If you want to store user reports in Supabase:

1. Go to **Database** → **Tables**
2. Create a table for reports:

```sql
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only see their own reports
CREATE POLICY "Users can view their own reports" ON reports
FOR ALL USING (auth.uid() = user_id);
```

## 6. Test the Setup

1. Save your changes to the `.env` file
2. Restart your development server:
   ```bash
   npm run dev
   ```
3. You should now see a login screen when you visit the app

## Features Included

✅ **Email/Password Authentication**
✅ **Social Login** (Google, GitHub)
✅ **User Profile Display**
✅ **Secure Session Management**
✅ **Protected Routes**
✅ **Responsive Design**

## Security Features

- Row Level Security (RLS) ready
- Environment variables for sensitive data
- Secure token handling
- Automatic session refresh

## Next Steps

After setting up the basic authentication, you might want to:

1. **Add user report history** - Store reports in Supabase database
2. **Add user profiles** - Allow users to manage their information
3. **Add email verification** - Require email confirmation
4. **Add password reset** - Allow users to reset forgotten passwords

Let me know if you need help implementing any of these features!
