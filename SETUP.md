# Setup Guide

This guide will walk you through setting up the Mock API App from scratch.

## 1. Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier: https://supabase.com)
- A Vercel account for deployment (free tier: https://vercel.com)

## 2. Clone and Install

```bash
# Install dependencies
npm install
```

## 3. Set Up Supabase

### 3.1 Create a New Project

1. Go to https://supabase.com
2. Click "New Project"
3. Choose an organization and provide:
   - Project name (e.g., "mock-api-app")
   - Database password (save this!)
   - Region (choose closest to your users)
4. Wait for the project to be created (~2 minutes)

### 3.2 Get API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

### 3.3 Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the query
5. You should see a success message

## 4. Configure Environment Variables

### 4.1 Create Local Environment File

```bash
# Copy the example file
cp .env.example .env.local
```

### 4.2 Fill in the Values

Edit `.env.local` and add:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 4.3 Generate NextAuth Secret

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value.

## 5. Create Your First User

Since the app uses manual user creation, you need to create users via the API.

### 5.1 Start the Development Server

```bash
npm run dev
```

The app should now be running at http://localhost:3000

### 5.2 Create a User via API

Use a tool like curl, Postman, or your browser. You must include the admin secret from your `.env.local` file:

**Linux/macOS/WSL:**
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" \
  -d '{
    "username": "admin",
    "password": "your-secure-password",
    "generateApiKey": true
  }'
```

**Windows PowerShell:**
```powershell
# Method 1: Using a JSON file (recommended)
# Create user.json:
# {
#   "username": "admin",
#   "password": "your-secure-password",
#   "generateApiKey": true
# }
curl.exe -X POST http://localhost:3000/api/users/create -H "Content-Type: application/json" -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" -d @user.json

# Method 2: Using Invoke-RestMethod
Invoke-RestMethod -Uri http://localhost:3000/api/users/create -Method POST -Headers @{"Content-Type"="application/json"; "x-admin-secret"="ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3"} -Body '{"username": "admin", "password": "your-secure-password", "generateApiKey": true}'
```

**Important:**
- Replace the `x-admin-secret` value with your actual `ADMIN_SECRET` from `.env.local`
- In PowerShell, use `curl.exe` instead of `curl` to use the actual curl binary
- WSL users: If running curl from WSL while the app is on Windows, use the Windows host IP instead of localhost

The response will include:
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "admin",
    "api_key": "your-generated-api-key"
  }
}
```

**IMPORTANT:** Save the `api_key`! You can use it to authenticate instead of username/password.

### 5.3 Sign In

1. Go to http://localhost:3000/auth/signin
2. Enter your username and password (or use the API key)
3. You should be redirected to the dashboard

## 6. Using the App

### 6.1 Create a Project

1. In the dashboard, click "New Project"
2. Enter a name and optional description
3. Click "Create Project"

### 6.2 Add an Endpoint

1. Click on your project
2. Click "New Endpoint"
3. Fill in the details:
   - **Method**: GET, POST, PUT, PATCH, or DELETE
   - **Path**: e.g., `/api/users`
   - **Status Code**: e.g., 200
   - **Response Body**: Your JSON, XML, or text response
   - **Require sub-key**: Optional, for additional security

### 6.3 Test Your Endpoint

On the project detail page, each endpoint has a "Test" section where you can:
1. See the full URL
2. Enter an API key (if required)
3. Click "Test" to see the response

### 6.4 Use Your Mock API

Your endpoints are available at:
```
http://localhost:3000/api/mock/{project-id}{your-path}
```

Each project has its own unique URL namespace to prevent conflicts.

For example, if your project ID is `abc-123` and your endpoint path is `/api/users`:
```bash
curl http://localhost:3000/api/mock/abc-123/api/users

# With API key (if required)
curl -H "x-api-key: your-key" http://localhost:3000/api/mock/abc-123/api/users
```

**Where to find your project ID:**
- In the browser URL when viewing a project: `/dashboard/projects/{project-id}`
- In the endpoint tester on the project detail page
- You can copy the full URL directly from the endpoint tester

## 7. Deploy to Vercel

### 7.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

### 7.2 Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from `.env.local`
   - Change `NEXTAUTH_URL` to your Vercel domain
5. Click "Deploy"

### 7.3 Update Supabase (Optional)

For production security, consider:
1. Enabling Row Level Security (RLS) in Supabase
2. Creating a service role key for server-side operations
3. Restricting API access by domain

## 8. Creating Additional Users

To create more users, you must provide the admin secret:

**Linux/macOS/WSL:**
```bash
curl -X POST https://your-domain.vercel.app/api/users/create \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-admin-secret-here" \
  -d '{
    "username": "newuser",
    "password": "secure-password",
    "generateApiKey": true
  }'
```

**Windows PowerShell:**
```powershell
# Using JSON file (recommended)
curl.exe -X POST https://your-domain.vercel.app/api/users/create -H "Content-Type: application/json" -H "x-admin-secret: your-admin-secret-here" -d @user.json

# Or using Invoke-RestMethod
Invoke-RestMethod -Uri https://your-domain.vercel.app/api/users/create -Method POST -Headers @{"Content-Type"="application/json"; "x-admin-secret"="your-admin-secret-here"} -Body '{"username": "newuser", "password": "secure-password", "generateApiKey": true}'
```

**Security Note:**
- The endpoint is now protected with the `ADMIN_SECRET` environment variable
- Only requests with the correct admin secret can create users
- Make sure to set `ADMIN_SECRET` in your Vercel environment variables
- Never share your admin secret publicly or commit it to version control
- For additional security, consider creating users directly in Supabase via the SQL Editor

## Need Help?

- Check the [README.md](README.md) for more information
- Review the Supabase documentation: https://supabase.com/docs
- Review the Next.js documentation: https://nextjs.org/docs
