# Gemini API Setup for YouTube Video Summarization

The backend now uses Google Gemini API for YouTube video summarization instead of Claude.

## Quick Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Add Gemini API key to `.env`:**
   ```env
   GEMINI_API_KEY=AIzaSyClNaGSx6iX-xycd-qHkb_4V9lANY-8E9A
   ```

   The API key is already configured as a default, but you can override it in your `.env` file.

## How It Works

1. **YouTube URL Detection**: When a YouTube URL is detected, the backend:
   - Extracts the video ID
   - Fetches the transcript using RapidAPI
   - Sends the transcript to Gemini API for summarization
   - Returns the summary which gets loaded into the notes field

2. **Summary Structure**: Gemini generates a structured summary with:
   - Main Topic
   - Key Points (3-5 points)
   - Important Details
   - Takeaways

## Gemini API Configuration

- **Model**: `gemini-1.5-pro` (latest and most capable model)
- **Default API Key**: Pre-configured in the code
- **Custom API Key**: Set `GEMINI_API_KEY` in `.env` to override

## Getting Your Own Gemini API Key (Optional)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file:
   ```env
   GEMINI_API_KEY=your_custom_key_here
   ```

## API Usage

The Gemini API is only used for YouTube video summarization. Regular webpage summaries still use Claude API via the LiteLLM proxy.

## Testing

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Test with a YouTube URL:
   - Go to Links page or YouTube page
   - Paste a YouTube URL
   - Click "Fetch"
   - The summary should appear in the notes field

## Troubleshooting

### Error: "API key not valid"
- Check that your `GEMINI_API_KEY` is correct in `.env`
- The default key should work, but if it doesn't, get your own from Google AI Studio

### Error: "Quota exceeded"
- The default API key may have rate limits
- Get your own API key from Google AI Studio for higher limits

### No summary generated
- Check backend logs for errors
- Verify the transcript was fetched successfully
- Some videos may not have transcripts available

