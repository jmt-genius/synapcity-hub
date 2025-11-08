# Setup Guide - Express Backend with Claude API

This guide will help you set up the Express backend server for link data extraction using Claude API.

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Create .env file manually
```

Edit `.env` and add your LiteLLM proxy configuration:

```env
# LiteLLM Proxy Configuration
ANTHROPIC_BASE_URL=https://litellm-339960399182.us-central1.run.app
ANTHROPIC_AUTH_TOKEN=your_api_key_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

**Note:** Replace `your_api_key_here` with your actual API key provided by Appointy. The backend uses the LiteLLM proxy, so you don't need to get a key from Anthropic directly.

### 4. Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001` by default.

You should see:
```
Server is running on port 3001
Health check: http://localhost:3001/health
```

## Frontend Setup

### 1. Configure Backend URL

Create or update `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:3001
```

If you don't set this, it will default to `http://localhost:3001`.

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

## Testing

### Test Backend Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Test Link Extraction

```bash
curl -X POST http://localhost:3001/api/extract-link \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## How It Works

1. **User clicks "Fetch" button** in the Links or Insert Data page
2. **Frontend sends POST request** to `/api/extract-link` with the URL
3. **Backend fetches webpage content** using `node-fetch` and `cheerio`
4. **Backend extracts metadata** (title, description, image)
5. **Backend sends content to Claude API** for summarization
6. **Backend returns** title, description, image, and summary
7. **Frontend autofills** the notes section with Claude's summary

## API Endpoints

### POST `/api/extract-link`

Extracts metadata and summarizes webpage content.

**Request:**
```json
{
  "url": "https://example.com/article"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "description": "Article description",
    "image": "https://example.com/image.jpg",
    "summary": "Claude-generated summary..."
  }
}
```

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Verify `CLAUDE_API_KEY` is set in `.env`
- Make sure all dependencies are installed: `npm install`

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check `VITE_BACKEND_URL` in frontend `.env`
- Check browser console for CORS errors (should be handled by backend)

### Claude API errors
- Verify your `ANTHROPIC_AUTH_TOKEN` is correct in `.env`
- Check that the LiteLLM proxy URL is correct
- Verify your API key is valid for the proxy
- Check API rate limits

### No summary generated
- Some pages may not have extractable text content
- Check backend logs for errors
- The description will be used as fallback

## Production Deployment

### Backend
- Set `PORT` environment variable
- Use a process manager like PM2
- Set up proper CORS for your frontend domain
- Keep `.env` secure and never commit it

### Frontend
- Set `VITE_BACKEND_URL` to your production backend URL
- Build with `npm run build`
- Deploy the `dist` folder

## Security Notes

- Never commit `.env` files
- Keep your `ANTHROPIC_AUTH_TOKEN` secure
- Consider adding rate limiting for production
- Validate URLs on the backend before fetching

## LiteLLM Proxy

This backend uses Appointy's LiteLLM proxy to access Claude API. The proxy URL (`https://litellm-339960399182.us-central1.run.app`) is pre-configured, so you only need to provide your API key in the `.env` file.

