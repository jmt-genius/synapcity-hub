/**
 * YouTube API utility for transcript extraction
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface YouTubeTranscriptResponse {
  success: boolean;
  data?: {
    url: string;
    videoId?: string;
    title?: string;
    description?: string;
    transcript?: string;
    thumbnail?: string;
    image?: string;
    summary?: string;
    tags?: string[];
  };
  error?: string;
}

/**
 * Extract YouTube video data including transcript
 * @param url - The YouTube URL to extract data from
 * @returns YouTube video data including transcript and summary
 */
export async function extractYouTubeData(url: string): Promise<NonNullable<YouTubeTranscriptResponse['data']>> {
  try {
    console.log('[Frontend YouTube] Sending request to backend:', url);
    const response = await fetch(`${BACKEND_URL}/api/extract-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('[Frontend YouTube] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Frontend YouTube] Error response:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Frontend YouTube] Full server response:', JSON.stringify(result, null, 2));
    console.log('[Frontend YouTube] Response details:', {
      success: result.success,
      hasData: !!result.data,
      hasSummary: !!result.data?.summary,
      summaryLength: result.data?.summary?.length || 0,
      summaryPreview: result.data?.summary?.substring(0, 200),
      hasTranscript: !!result.data?.transcript,
      transcriptLength: result.data?.transcript?.length || 0,
      transcriptPreview: result.data?.transcript?.substring(0, 200)
    });

    if (!result.success || !result.data) {
      console.error('[Frontend YouTube] Invalid response structure:', result);
      throw new Error(result.error || 'Failed to extract YouTube data');
    }

    return result.data;
  } catch (error: any) {
    console.error('[Frontend YouTube] Error in extractYouTubeData:', error);
    throw new Error(`Failed to extract YouTube data: ${error.message}`);
  }
}

