# How to Get Your Supabase Access Token

The extension now requires an **Access Token (JWT)** to work with your RLS policies. The access token authenticates you as a user, allowing `auth.uid()` to work in your policies.

## Method 1: Using Supabase Dashboard (Quick Test)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Find your user and click on it
4. In the user details, you can see the user ID, but you'll need to get a token programmatically

## Method 2: Using Supabase Auth API (Recommended)

### Step 1: Sign in via API

Use this curl command or run it in your browser console on your Supabase project:

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

### Step 2: Extract the Access Token

The response will look like:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "user-uuid-here",
    ...
  }
}
```

Copy the `access_token` value and paste it into the extension settings.

### Step 3: Get User ID

The `user.id` from the response is your User ID. Make sure this matches the `user_id` you're using in the extension settings.

## Method 3: Using JavaScript (Browser Console)

1. Open your Supabase project dashboard
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this code (replace with your credentials):

```javascript
fetch('https://YOUR_PROJECT.supabase.co/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: {
    'apikey': 'YOUR_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Access Token:', data.access_token);
  console.log('User ID:', data.user.id);
  // Copy these values to your extension settings
});
```

## Method 4: Using Supabase Client Library

If you have a web app using Supabase:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'your-email@example.com',
  password: 'your-password'
});

if (data.session) {
  console.log('Access Token:', data.session.access_token);
  console.log('User ID:', data.session.user.id);
}
```

## Important Notes

1. **Token Expiration**: Access tokens expire (usually after 1 hour). You'll need to refresh or get a new token when it expires.

2. **User ID Match**: The `user_id` in your extension settings must match the user ID in the access token for RLS policies to work (`auth.uid() = user_id`).

3. **Security**: Never share your access token publicly. It's stored securely in Chrome's sync storage.

4. **Token Refresh**: For production, consider implementing token refresh logic, or use a longer-lived token if your Supabase project allows it.

## Troubleshooting

- **"Access Token is missing"**: Make sure you've entered the access token in the extension settings.
- **"RLS policy violation"**: Ensure the user ID in your token matches the `user_id` you're inserting.
- **Token expired**: Get a new access token using one of the methods above.

