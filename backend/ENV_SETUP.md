# Environment Variables Setup

Create a `.env` file in the `backend` directory with the following content:

```env
# LiteLLM Proxy Configuration
ANTHROPIC_BASE_URL=https://litellm-339960399182.us-central1.run.app
ANTHROPIC_AUTH_TOKEN=your_api_key_here

# RapidAPI Key for YouTube Transcripts (optional, defaults to provided key)
RAPIDAPI_KEY=your_rapidapi_key_here

# Gemini API Key (for YouTube video summarization)
GEMINI_API_KEY=AIzaSyClNaGSx6iX-xycd-qHkb_4V9lANY-8E9A

# Server Port (optional, defaults to 3001)
PORT=3001
```

## Steps:

1. Navigate to the `backend` directory
2. Create a new file named `.env`
3. Copy the content above into the file
4. Replace `your_api_key_here` with your actual API key provided by Appointy
5. Save the file

The `.env` file is already in `.gitignore`, so it won't be committed to version control.

## Important Notes:

- The `ANTHROPIC_BASE_URL` is pre-configured to use Appointy's LiteLLM proxy
- You only need to update the `ANTHROPIC_AUTH_TOKEN` with your API key
- The `RAPIDAPI_KEY` is optional - a default key is included, but you can provide your own
- The `GEMINI_API_KEY` is pre-configured with a default key, but you can get your own from [Google AI Studio](https://makersuite.google.com/app/apikey)
- The `PORT` is optional and defaults to 3001 if not specified

