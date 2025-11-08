# Extension Configuration

## Your Supabase Credentials

Use these values in the extension settings:

### Supabase URL
```
https://xxakhnnffkzhbqzblrly.supabase.co
```

### Supabase Anon Key (Publishable Key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YWtobm5mZmt6aGJxemJscmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzE4NTEsImV4cCI6MjA3ODE0Nzg1MX0.LF2lirf7HzjymThiVPRQJCYEri3tmFIW3-yE6RyPYrU
```

### Project ID
```
xxakhnnffkzhbqzblrly
```

## Still Needed

You still need to get:
1. **Access Token (JWT)** - See `HOW_TO_GET_ACCESS_TOKEN.md`
2. **User ID (UUID)** - This comes from your authenticated user

## Quick Setup Steps

1. Open the extension settings page
2. Enter the Supabase URL and Anon Key from above
3. Get your Access Token (see instructions below)
4. Get your User ID from the token response
5. Save settings

## Getting Your Access Token

Run this in your browser console or use curl:

```javascript
// In browser console on your Supabase project
fetch('https://xxakhnnffkzhbqzblrly.supabase.co/auth/v1/token?grant_type=password', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YWtobm5mZmt6aGJxemJscmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzE4NTEsImV4cCI6MjA3ODE0Nzg1MX0.LF2lirf7HzjymThiVPRQJCYEri3tmFIW3-yE6RyPYrU',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'YOUR_EMAIL',
    password: 'YOUR_PASSWORD'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Access Token:', data.access_token);
  console.log('User ID:', data.user.id);
});
```

Or use curl:
```bash
curl -X POST 'https://xxakhnnffkzhbqzblrly.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4YWtobm5mZmt6aGJxemJscmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NzE4NTEsImV4cCI6MjA3ODE0Nzg1MX0.LF2lirf7HzjymThiVPRQJCYEri3tmFIW3-yE6RyPYrU" \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_EMAIL", "password": "YOUR_PASSWORD"}'
```

