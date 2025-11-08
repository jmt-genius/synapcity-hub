# SynapCity Backend

Express.js backend server for link data extraction, AI-powered summarization, and semantic search.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables Setup

Create a `.env` file in the `backend` directory:

```env
# LiteLLM Proxy Configuration (for Claude API)
ANTHROPIC_BASE_URL=https://litellm-339960399182.us-central1.run.app
ANTHROPIC_AUTH_TOKEN=your_api_key_here

# Gemini API Key (for YouTube video summarization)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

**Required Variables:**
- `ANTHROPIC_AUTH_TOKEN` - Your API key for the LiteLLM proxy (required)
- `GEMINI_API_KEY` - Google Gemini API key (required for YouTube summarization)

**Optional Variables:**
- `ANTHROPIC_BASE_URL` - Defaults to the provided LiteLLM proxy URL
- `PORT` - Server port (defaults to 3001)

### 3. Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001` by default.

## 📡 API Endpoints

### POST `/api/extract-link`

Extracts metadata and generates AI summaries from URLs.

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
    "summary": "AI-generated summary...",
    "tags": ["tag1", "tag2"]
  }
}
```

**Features:**
- Automatically detects YouTube URLs
- For YouTube: Generates title, tags, and summary using Gemini API
- For regular links: Extracts metadata and generates summary using Claude API

### POST `/api/ai-search`

Performs semantic search across items using Gemini AI.

**Request:**
```json
{
  "query": "What are the best practices for React?",
  "items": [
    {
      "id": "uuid",
      "title": "Item Title",
      "notes": "Item notes content..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "matchingIds": ["uuid1", "uuid2"]
}
```

**Features:**
- Processes items in batches of 3
- Uses Gemini AI for semantic matching
- Returns array of matching item IDs

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 🔧 Configuration

### Claude API (via LiteLLM Proxy)

The backend uses Appointy's LiteLLM proxy to access Claude API. The proxy URL is pre-configured, you only need to provide your API key.

### Gemini API

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## 🐛 Troubleshooting

### Server won't start
- Check if port 3001 is already in use
- Verify all environment variables are set correctly
- Ensure all dependencies are installed: `npm install`

### API errors
- Verify `ANTHROPIC_AUTH_TOKEN` is correct
- Check `GEMINI_API_KEY` is valid
- Review server logs for detailed error messages

### YouTube summarization not working
- Verify `GEMINI_API_KEY` is set correctly
- Check that the YouTube URL is valid and accessible
- Review backend logs for Gemini API errors

## 📦 Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `@anthropic-ai/sdk` - Claude API client
- `@google/generative-ai` - Gemini API client
- `node-fetch` - HTTP client
- `cheerio` - HTML parsing

## 🔒 Security Notes

- Never commit `.env` files to version control
- Keep API keys secure
- Consider adding rate limiting for production
- Validate URLs before processing
