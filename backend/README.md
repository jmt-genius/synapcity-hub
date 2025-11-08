# SynapCity Backend

Express backend server for link data extraction using Claude API.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```bash
# Create .env file manually or copy from example
```

3. Add your LiteLLM proxy configuration to `.env`:
```env
# LiteLLM Proxy Configuration
ANTHROPIC_BASE_URL=https://litellm-339960399182.us-central1.run.app
ANTHROPIC_AUTH_TOKEN=your_api_key_here

# RapidAPI Key for YouTube Transcripts (optional, defaults to provided key)
RAPIDAPI_KEY=your_rapidapi_key_here

# Gemini API Key (for YouTube video summarization)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (optional, defaults to 3001)
PORT=3001
```

**Note:** 
- Replace `your_api_key_here` with your actual API key provided by Appointy.
- The `RAPIDAPI_KEY` is optional - the server includes a default key, but you can provide your own if needed.
- The `GEMINI_API_KEY` is required for YouTube video summarization. You can use the provided key or get your own from [Google AI Studio](https://makersuite.google.com/app/apikey).

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001` by default.

## API Endpoints

### POST `/api/extract-link`

Extracts metadata and summarizes content from a URL using Claude API. For YouTube URLs, it also extracts the video transcript and generates a summary.

**YouTube Support:**
- Automatically detects YouTube URLs
- Fetches video transcript using RapidAPI
- Generates summary using Google Gemini API
- Returns transcript, summary, and thumbnail

**Request Body:**
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
    "summary": "Claude-generated summary of the webpage content..."
  }
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Environment Variables

- `ANTHROPIC_BASE_URL` - LiteLLM proxy URL (defaults to `https://litellm-339960399182.us-central1.run.app`)
- `ANTHROPIC_AUTH_TOKEN` - Your API key for the LiteLLM proxy (required)
- `RAPIDAPI_KEY` - RapidAPI key for YouTube transcript extraction (optional, defaults to provided key)
- `GEMINI_API_KEY` - Google Gemini API key for YouTube video summarization (required, defaults to provided key)
- `PORT` - Server port (optional, defaults to 3001)

## LiteLLM Proxy Configuration

This backend uses Appointy's LiteLLM proxy to access Claude API. The proxy URL is pre-configured, but you need to provide your API key in the `.env` file.

The backend automatically uses the LiteLLM proxy endpoint, so you don't need to configure anything else beyond the API key.

