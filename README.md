# Mock API App

A web application that allows users to create and manage mock API endpoints for development and testing purposes.

## Features

- User authentication (username/password or API key)
- Project management (organize endpoints into projects)
- Custom API endpoint creation (GET, POST, PUT, DELETE, etc.)
- Custom response configuration
- Optional API sub-keys for specific endpoints
- Free hosting on Vercel with Supabase database

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available at https://supabase.com)

### Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Go to https://supabase.com and create a new project
   - Once created, go to Project Settings > API
   - Copy the Project URL and anon/public key
   - Go to the SQL Editor and run the schema creation script (see Database Schema section below)

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Generate a NEXTAUTH_SECRET:
     ```bash
     openssl rand -base64 32
     ```
   - Add it to `.env.local`:
     ```
     NEXTAUTH_SECRET=your_generated_secret
     NEXTAUTH_URL=http://localhost:3000
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to http://localhost:3000

## Database Schema

Run this SQL in your Supabase SQL Editor to create the necessary tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  api_key TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Endpoints table
CREATE TABLE endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  response_body TEXT,
  status_code INTEGER DEFAULT 200,
  requires_sub_key BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, method, path)
);

-- API Keys table (for endpoint-specific sub-keys)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES endpoints(id) ON DELETE CASCADE,
  key_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_endpoints_project_id ON endpoints(project_id);
CREATE INDEX idx_api_keys_endpoint_id ON api_keys(endpoint_id);
```

## Deployment

This app is designed to be deployed on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add your environment variables in Vercel project settings
4. Update `NEXTAUTH_URL` to your production URL
5. Deploy!

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
