# User Management Guide

This guide explains how to manage users in your Mock API App.

## Prerequisites

You need your **Admin Secret** from `.env.local`:
```bash
ADMIN_SECRET=ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3
```

All user management operations require this secret in the `x-admin-secret` header.

## 1. Create a New User

**Endpoint:** `POST /api/users/create`

**Request:**
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" \
  -d '{
    "username": "newuser",
    "password": "secure-password-123",
    "generateApiKey": true
  }'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "username": "newuser",
    "api_key": "generated-api-key-here"
  }
}
```

**Notes:**
- `generateApiKey` is optional (default: false)
- If `generateApiKey: true`, user can login with API key instead of password
- Save the API key - it's only shown once!

## 2. Update User Password

**Endpoint:** `PUT /api/users/update-password`

**Option A: Update by Username**
```bash
curl -X PUT http://localhost:3000/api/users/update-password \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" \
  -d '{
    "username": "johndoe",
    "newPassword": "new-secure-password-456"
  }'
```

**Option B: Update by User ID**
```bash
curl -X PUT http://localhost:3000/api/users/update-password \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" \
  -d '{
    "userId": "uuid-here",
    "newPassword": "new-secure-password-456"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password updated successfully",
  "user": {
    "id": "uuid-here",
    "username": "johndoe"
  }
}
```

## 3. Delete a User

**Endpoint:** `DELETE /api/users/[id]`

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/users/UUID-HERE \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3"
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Important:** This will also delete:
- All projects owned by the user
- All endpoints in those projects
- All API keys for those endpoints

## 4. Get User ID

If you need to find a user's ID, use Supabase:

1. Go to Supabase Dashboard
2. Click **Table Editor** > **users**
3. Find the user by username
4. Copy their `id` (UUID)

## Security Notes

### ✅ What's Secure:

- **Admin Secret Required:** All user management operations require the admin secret
- **Row Level Security (RLS):** Enabled on all tables - blocks direct database access
- **Service Role Key:** Only server-side code can bypass RLS
- **Password Hashing:** All passwords are hashed with bcrypt

### 🔒 Important Reminders:

1. **Never share your admin secret** - it's like a master password
2. **Never commit secrets to git** - they're in `.env.local` which is gitignored
3. **Set strong passwords** - especially for admin users
4. **When deploying to Vercel:**
   - Add `ADMIN_SECRET` to environment variables
   - Add `SUPABASE_SERVICE_ROLE_KEY` to environment variables
   - Never expose these in client-side code

### 🚫 What's Blocked:

With RLS enabled, these operations are now **impossible** via the public anon key:
- ❌ Directly reading the users table
- ❌ Directly creating/updating/deleting users
- ❌ Accessing other users' projects
- ❌ Modifying endpoints without authentication

## Production Deployment

When deploying to Vercel, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ugnngthexzyqcfmmetee.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
ADMIN_SECRET=ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3
```

## Troubleshooting

### "Unauthorized - Invalid or missing admin secret"
- Check that you're passing `x-admin-secret` header
- Verify the secret matches your `.env.local` file
- Make sure there are no extra spaces or quotes

### "User not found"
- Verify the user ID or username is correct
- Check in Supabase Table Editor if the user exists

### "Failed to create user" or "Failed to update password"
- Check server logs for detailed error
- Verify Supabase connection is working
- Ensure RLS policies are correctly configured

## Examples

### Create an admin user:
```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" \
  -d '{
    "username": "admin",
    "password": "SuperSecure123!",
    "generateApiKey": true
  }'
```

### Reset a forgotten password:
```bash
curl -X PUT http://localhost:3000/api/users/update-password \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3" \
  -d '{
    "username": "johndoe",
    "newPassword": "NewPassword123!"
  }'
```

### Remove a test user:
```bash
# First, get the user ID from Supabase, then:
curl -X DELETE http://localhost:3000/api/users/47410fc8-1ca7-4cc0-a6c8-f8c574fdf600 \
  -H "x-admin-secret: ea37023ee63489d404831077185cd3c260561e837c6c317492ad5bafce792cf3"
```
