import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Claude client with LiteLLM proxy
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://litellm-339960399182.us-central1.run.app',
});

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyClNaGSx6iX-xycd-qHkb_4V9lANY-8E9A');

/**
 * Fetch webpage content and extract text
 */
async function fetchWebpageContent(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text() || 
                  $('meta[property="og:title"]').attr('content') ||
                  $('h1').first().text() ||
                  'Untitled';

    // Extract description
    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       '';

    // Extract image
    const image = $('meta[property="og:image"]').attr('content') ||
                  $('meta[name="twitter:image"]').attr('content') ||
                  $('img').first().attr('src') ||
                  null;

    // Extract main content - remove scripts, styles, and other non-content elements
    $('script, style, nav, footer, header, aside, .advertisement, .ad, .sidebar').remove();
    
    // Get text content from main content areas
    const mainContent = $('main, article, .content, .post, .article').first();
    let textContent = '';
    
    if (mainContent.length > 0) {
      textContent = mainContent.text();
    } else {
      // Fallback: get text from body, but limit it
      textContent = $('body').text();
    }

    // Clean up text content
    textContent = textContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()
      .substring(0, 50000); // Limit to 50k characters for Claude

    return {
      title: title.trim(),
      description: description.trim(),
      image: image ? (image.startsWith('http') ? image : new URL(image, url).href) : null,
      textContent: textContent
    };
  } catch (error) {
    throw new Error(`Failed to fetch webpage: ${error.message}`);
  }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/**
 * Check if URL is a YouTube URL
 */
function isYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

/**
 * Summarize YouTube video using Gemini API
 * Uses fileData format to pass YouTube video URL to Gemini
 * Returns title, tags, and summary
 */
async function summarizeYouTubeVideo(url, videoId) {
  try {
    console.log(`[Gemini] Starting summarization for video: ${videoId}`);
    
    // Construct video URL from video ID
    const video_url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[Gemini] Video URL: ${video_url}`);
    
    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log(`[Gemini] Model initialized: gemini-2.5-flash`);

    const prompt_text = `Please watch and analyze this YouTube video.

Provide the following information in a structured format:

TITLE: [Provide a clear, descriptive title for this video (max 100 characters)]

TAGS: [Provide 5-10 relevant tags separated by commas (e.g., technology, tutorial, coding, web development)]

SUMMARY:
Provide a comprehensive and well-structured summary that includes:

1. Main Topic

2. Key Points (3-5)

3. Important Details

4. Takeaways

Format your response exactly as shown above with TITLE:, TAGS:, and SUMMARY: labels.`;

    console.log(`[Gemini] Prompt length: ${prompt_text.length} characters`);
    console.log(`[Gemini] Sending request to Gemini API with YouTube video fileData...`);

    // Generate content using Gemini with fileData format for YouTube video
    const ytVideo = {
      fileData: {
        fileUri: video_url,
        mimeType: 'video/mp4',
      },
    };

    const result = await model.generateContent([ytVideo, prompt_text]);
    const response = await result.response;
    const fullResponse = response.text();

    console.log(`[Gemini] Full response received, length: ${fullResponse.length} characters`);
    console.log(`[Gemini] Response preview: ${fullResponse.substring(0, 500)}...`);

    // Parse the response to extract title, tags, and summary
    let title = `YouTube Video - ${videoId}`;
    let tags = [];
    let summary = fullResponse;

    // Try to extract TITLE
    const titleMatch = fullResponse.match(/TITLE:\s*(.+?)(?:\n|TAGS:|SUMMARY:)/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].trim();
      console.log(`[Gemini] Extracted title: ${title}`);
    }

    // Try to extract TAGS
    const tagsMatch = fullResponse.match(/TAGS:\s*(.+?)(?:\n|SUMMARY:)/i);
    if (tagsMatch && tagsMatch[1]) {
      const tagsString = tagsMatch[1].trim();
      tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
      console.log(`[Gemini] Extracted tags: ${tags.join(', ')}`);
    }

    // Try to extract SUMMARY
    const summaryMatch = fullResponse.match(/SUMMARY:\s*([\s\S]+)/i);
    if (summaryMatch && summaryMatch[1]) {
      summary = summaryMatch[1].trim();
      console.log(`[Gemini] Extracted summary, length: ${summary.length} characters`);
    } else {
      // If no SUMMARY label found, use the full response as summary
      summary = fullResponse.trim();
    }

    return {
      title: title,
      tags: tags,
      summary: summary
    };
  } catch (error) {
    console.error(`[Gemini] Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Failed to summarize YouTube video with Gemini: ${error.message}`);
  }
}

/**
 * AI Search: Check if search query relates to item notes using Gemini
 * Processes items in batches of 3
 * @param query - The search query/question
 * @param items - Array of items with id and notes
 * @returns Array of matching item IDs
 */
async function aiSearchItems(query, items) {
  try {
    console.log(`[AI Search] Starting AI search with query: "${query}"`);
    console.log(`[AI Search] Processing ${items.length} items in batches of 3`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const matchingIds = [];

    // Process items in batches of 3
    for (let i = 0; i < items.length; i += 3) {
      const batch = items.slice(i, i + 3);
      console.log(`[AI Search] Processing batch ${Math.floor(i / 3) + 1} with ${batch.length} items`);

      try {
        // Create prompt for this batch
        const itemsData = batch.map(item => ({
          id: item.id,
          title: item.title || 'Untitled',
          notes: item.notes || ''
        }));

        const prompt_text = `You are analyzing items to find which ones relate to the user's search query.

Search Query: "${query}"

Items to analyze:
${itemsData.map((item, idx) => `
Item ${idx + 1}:
- ID: ${item.id}
- Title: ${item.title}
- Notes: ${item.notes || 'No notes available'}
`).join('\n')}

For each item, determine if the notes content relates to or answers the search query. Consider:
- Direct matches in the notes
- Semantic similarity
- Conceptual relationships
- Whether the notes provide information relevant to the query

Respond with ONLY a JSON array of item IDs that match the query. If no items match, return an empty array [].

Example response format: ["id1", "id2"] or []

Do not include any explanation, only the JSON array.`;

        console.log(`[AI Search] Sending batch to Gemini...`);
        const result = await model.generateContent(prompt_text);
        const response = await result.response;
        const responseText = response.text().trim();

        console.log(`[AI Search] Gemini response: ${responseText.substring(0, 200)}...`);

        // Try to extract JSON array from response
        let batchMatches = [];
        try {
          // Try to find JSON array in the response
          const jsonMatch = responseText.match(/\[.*?\]/);
          if (jsonMatch) {
            batchMatches = JSON.parse(jsonMatch[0]);
            console.log(`[AI Search] Parsed ${batchMatches.length} matches from batch`);
          } else {
            console.warn(`[AI Search] No JSON array found in response`);
          }
        } catch (parseError) {
          console.error(`[AI Search] Error parsing JSON:`, parseError);
          // Try to extract IDs manually
          batch.forEach(item => {
            if (responseText.toLowerCase().includes(item.id.toLowerCase())) {
              batchMatches.push(item.id);
            }
          });
        }

        // Validate that returned IDs exist in the batch
        const validMatches = batchMatches.filter(id => 
          batch.some(item => item.id === id)
        );
        
        matchingIds.push(...validMatches);
        console.log(`[AI Search] Batch ${Math.floor(i / 3) + 1} completed. Found ${validMatches.length} matches.`);

      } catch (batchError) {
        console.error(`[AI Search] Error processing batch ${Math.floor(i / 3) + 1}:`, batchError);
        // Continue with next batch even if this one fails
      }
    }

    console.log(`[AI Search] Completed. Total matches: ${matchingIds.length}`);
    return matchingIds;
  } catch (error) {
    console.error(`[AI Search] Error in aiSearchItems:`, error);
    throw new Error(`Failed to perform AI search: ${error.message}`);
  }
}

/**
 * Summarize content using Claude API (for regular webpages)
 */
async function summarizeWithClaude(textContent, url) {
  try {
    const prompt = `Please provide a concise summary of the following webpage content. Focus on the main points, key information, and important details. Keep the summary informative but brief (2-4 paragraphs, around 300-500 words).

URL: ${url}

Content:
${textContent}

Please provide a well-structured summary that captures the essence of the content.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text from Claude's response
    const summary = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return summary.trim();
  } catch (error) {
    throw new Error(`Failed to summarize with Claude: ${error.message}`);
  }
}

/**
 * Main endpoint to extract link data
 */
app.post('/api/extract-link', async (req, res) => {
  try {
    const { url } = req.body;
    console.log(`[Extract Link] Received request for URL: ${url}`);

    if (!url) {
      console.error('[Extract Link] No URL provided in request');
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
      console.log(`[Extract Link] URL validated successfully`);
    } catch {
      console.error(`[Extract Link] Invalid URL format: ${url}`);
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if it's a YouTube URL
    if (isYouTubeUrl(url)) {
      console.log(`[Extract Link] Detected YouTube URL: ${url}`);
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        console.error(`[Extract Link] Could not extract video ID from URL: ${url}`);
        return res.status(400).json({ error: 'Could not extract video ID from URL' });
      }

      console.log(`[Extract Link] Extracted video ID: ${videoId}`);
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      // Summarize video directly with Gemini
      let videoData = {
        title: `YouTube Video - ${videoId}`,
        tags: [],
        summary: 'Unable to generate summary for this video.'
      };
      
      try {
        console.log(`[Extract Link] Generating summary with Gemini for video: ${videoId}`);
        videoData = await summarizeYouTubeVideo(url, videoId);
        console.log(`[Extract Link] Summary generated successfully:`, {
          title: videoData.title,
          tagsCount: videoData.tags?.length || 0,
          summaryLength: videoData.summary?.length || 0
        });
      } catch (error) {
        console.error('[Extract Link] Gemini summarization error:', error.message);
        console.error('[Extract Link] Full error details:', error);
      }

      const responseData = {
        success: true,
        data: {
          url: url,
          title: videoData.title,
          description: `YouTube video summary`,
          image: thumbnail,
          summary: videoData.summary,
          tags: videoData.tags || []
        }
      };

      console.log(`[Extract Link] Sending YouTube response:`, {
        success: responseData.success,
        title: responseData.data.title,
        tagsCount: responseData.data.tags?.length || 0,
        hasSummary: !!responseData.data.summary,
        summaryLength: responseData.data.summary?.length || 0
      });

      // Return YouTube data
      return res.json(responseData);
    }

    // Regular webpage extraction
    // Fetch webpage content
    const webpageData = await fetchWebpageContent(url);

    // Summarize content with Claude
    let summary = '';
    if (webpageData.textContent && webpageData.textContent.length > 100) {
      try {
        summary = await summarizeWithClaude(webpageData.textContent, url);
      } catch (error) {
        console.error('Claude summarization error:', error);
        // Continue without summary if Claude fails
        summary = webpageData.description || '';
      }
    } else {
      summary = webpageData.description || '';
    }

    // Return extracted data
    res.json({
      success: true,
      data: {
        url: url,
        title: webpageData.title,
        description: webpageData.description,
        image: webpageData.image,
        summary: summary
      }
    });
  } catch (error) {
    console.error('[Extract Link] Error extracting link:', error);
    console.error('[Extract Link] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract link data'
    });
  }
});

/**
 * AI Search endpoint
 * Takes a search query and items, returns matching item IDs
 */
app.post('/api/ai-search', async (req, res) => {
  try {
    const { query, items } = req.body;
    console.log(`[AI Search API] Received request with query: "${query}"`);
    console.log(`[AI Search API] Processing ${items?.length || 0} items`);

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('[AI Search API] Invalid query provided');
      return res.status(400).json({ error: 'Search query is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('[AI Search API] Invalid items array provided');
      return res.status(400).json({ error: 'Items array is required' });
    }

    // Filter items that have notes (AI search only works with notes)
    const itemsWithNotes = items.filter(item => item.notes && item.notes.trim().length > 0);
    
    if (itemsWithNotes.length === 0) {
      console.log('[AI Search API] No items with notes found');
      return res.json({
        success: true,
        matchingIds: []
      });
    }

    console.log(`[AI Search API] Found ${itemsWithNotes.length} items with notes`);

    // Perform AI search
    const matchingIds = await aiSearchItems(query.trim(), itemsWithNotes);

    console.log(`[AI Search API] Returning ${matchingIds.length} matching IDs`);

    res.json({
      success: true,
      matchingIds: matchingIds
    });
  } catch (error) {
    console.error('[AI Search API] Error:', error);
    console.error('[AI Search API] Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform AI search'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

