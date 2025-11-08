# Quick Start Guide

## ⚠️ Important: Access Token vs JWT Signing Key

**DO NOT use the JWT signing key!** 

- ❌ **JWT Signing Key**: This is a secret key from Supabase Settings → API → JWT Secret. This is NOT what you need.
- ✅ **Access Token**: This is what you get after signing in as a user. This is what you need.

## Step-by-Step Setup

### Step 1: Get Your Access Token

You have two options:

#### Option A: Use the Helper Page (Easiest)

1. Open `GET_TOKEN.html` in your browser (double-click the file)
2. Enter your Supabase user email and password
3. Click "Get Access Token"
4. Copy both the Access Token and User ID

#### Option B: Use Browser Console

1. Go to your Supabase Dashboard
2. Open browser DevTools (F12) → Console tab
3. Paste and run this code (replace email/password):

```javascript
fetch('https://xxakhnnffkzhbqzblrly.supabase.co/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YWtobm5mZmt6aGJxemJscmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzE4NTEsImV4cCI6MjA3ODE0Nzg1MX0.LF2lirf7HzjymThiVPRQJCYEri3tmFIW3-yE6RyPYrU',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'YOUR_EMAIL_HERE',
    password: 'YOUR_PASSWORD_HERE'
  })
})
.then(r => r.json())
.then(data => {
  console.log('✅ Access Token:', data.access_token);
  console.log('✅ User ID:', data.user.id);
  console.log('\n📋 Copy these values to extension settings!');
});
```

### Step 2: Configure Extension

1. Right-click the extension icon → **Options** (or go to `chrome://extensions` → find extension → click "Extension options")
2. The Supabase URL and Anon Key are already filled in
3. Paste your **Access Token** (from Step 1)
4. Paste your **User ID** (from Step 1)
5. Click **Save Settings**

### Step 3: Test

1. Right-click on any webpage
2. Select **"Save to Synapcity"**
3. It should save successfully! ✅

## Troubleshooting

### "Expected 3 parts in JWT; got 1"
- **Problem**: You're using the JWT signing key instead of an access token
- **Solution**: Use `GET_TOKEN.html` or the browser console method above to get a real access token

### "Access Token is missing"
- Make sure you've entered the access token in settings (not the JWT signing key)

### "RLS policy violation"
- Make sure the User ID in your token matches the User ID you entered in settings
- The user must exist in your Supabase Auth users table

## What is an Access Token?

An access token is a JWT (JSON Web Token) that:
- Contains your user information
- Proves you're authenticated
- Allows `auth.uid()` to work in RLS policies
- Expires after some time (usually 1 hour)

When you sign in, Supabase gives you this token. It's different from the JWT signing key, which is a secret used by Supabase to create tokens.

