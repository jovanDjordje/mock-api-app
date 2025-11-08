# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mock-API-App - A full-stack web application that allows users to create and manage custom mock API endpoints for development and testing purposes.

### Features
- User authentication (username/password or API key)
- Project-based organization of endpoints
- Custom API endpoint creation (GET, POST, PUT, PATCH, DELETE)
- Custom response configuration (JSON, XML, or plain text)
- **AI-powered response generation** using Google Gemini (describe what you want, AI generates realistic mock data)
- Optional API sub-keys for endpoint-level security
- In-browser endpoint testing
- Free hosting on Vercel with Supabase database

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)
- Vercel account for deployment (optional)

### Installation
```bash
npm install
```

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Set up a Supabase project and get credentials
3. Run the SQL schema from `supabase/schema.sql` in Supabase SQL Editor
4. Add your Supabase URL and anon key to `.env.local`
5. Generate and add NEXTAUTH_SECRET to `.env.local`
6. **(Optional)** Add GOOGLE_GEMINI_API_KEY to enable AI-powered response generation

See [SETUP.md](SETUP.md) for detailed setup instructions.

### Running Locally
```bash
npm run dev
```
Access at http://localhost:3000

### Creating Users
Users must be created via the API with the admin secret:

**Linux/macOS/WSL:**
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-admin-secret-from-env-file" \
  -d '{"username": "admin", "password": "secure-password", "generateApiKey": true}'
```

**Windows PowerShell (using JSON file):**
```powershell
# Create a user.json file with your user data, then:
curl.exe -X POST http://localhost:3000/api/users/create -H "Content-Type: application/json" -H "x-admin-secret: your-admin-secret-from-env-file" -d @user.json
```

**Note:** In PowerShell, use `curl.exe` instead of `curl` to use the actual curl binary. Alternatively, use a JSON file with `-d @filename` to avoid escaping issues.

## Architecture

### Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with credentials provider
- **AI Integration**: Google Gemini 2.0 Flash (optional, for response generation)
- **UI Components**: shadcn/ui with Tailwind CSS
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Key Directories
- `/app` - Next.js App Router pages and API routes
- `/components` - React components and UI elements
- `/lib` - Utility functions and configurations
- `/lib/ai` - AI provider abstraction and integrations
- `/supabase` - Database schema and migrations
- `/types` - TypeScript type definitions

### Database Schema
- **users** - User accounts with credentials and optional API keys
- **projects** - Project containers for organizing endpoints
- **endpoints** - Mock API endpoint definitions
- **api_keys** - Optional sub-keys for endpoint-level authentication

### API Routes
- `/api/auth/[...nextauth]` - NextAuth authentication
- `/api/users/create` - User creation (protected with ADMIN_SECRET)
- `/api/projects` - Project CRUD operations
- `/api/projects/[id]/endpoints` - Endpoint CRUD operations
- `/api/ai/generate-response` - AI-powered response generation (requires authentication)
- `/api/mock/[projectId]/[...path]` - Dynamic route for serving mock endpoints

### Request Flow
1. User authenticates via NextAuth
2. Creates projects and endpoints through dashboard
3. Mock endpoints are accessible at `/api/mock/{project-id}{custom-path}`
4. Requests are matched by project ID, method, and path
5. Each project has its own URL namespace to prevent conflicts
6. Optional API key validation if required
7. Custom response returned with configured status code

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Deployment

See [SETUP.md](SETUP.md) for Vercel deployment instructions.

### Important Notes
- `/api/users/create` is protected with ADMIN_SECRET environment variable
- Set proper NEXTAUTH_URL for production
- Add ADMIN_SECRET to Vercel environment variables
- **(Optional)** Add GOOGLE_GEMINI_API_KEY to Vercel to enable AI response generation
- Consider enabling Supabase Row Level Security (RLS)
- All environment variables must be configured in Vercel

### AI-Powered Response Generation

The app includes optional AI-powered mock response generation:
- Click "Generate with AI ✨" button in endpoint creation/edit forms
- Describe what you want in natural language
- AI generates realistic JSON, XML, or plain text responses
- Preview and approve before using

**Setup:**
1. Get a free API key from https://aistudio.google.com/app/apikey
2. Add `GOOGLE_GEMINI_API_KEY` to `.env.local` (local) or Vercel (production)
3. If not configured, the "Generate with AI" button won't appear

**Architecture:**
- Extensible provider system in `/lib/ai`
- Currently uses Google Gemini 2.0 Flash
- Easy to add other providers (OpenAI, Claude, Ollama, etc.)
