/**
 * Backend API utility for link extraction
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface LinkExtractionResponse {
  success: boolean;
  data?: {
    url: string;
    title: string;
    description: string;
    image: string | null;
    summary: string;
    tags?: string[];
  };
  error?: string;
}

/**
 * Extract link data and get summary from backend
 * @param url - The URL to extract data from
 * @returns Link extraction data including Claude-generated summary
 */
export async function extractLinkData(url: string): Promise<LinkExtractionResponse['data']> {
  try {
    console.log('[Frontend] Sending request to backend:', url);
    const response = await fetch(`${BACKEND_URL}/api/extract-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    console.log('[Frontend] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Frontend] Error response:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: LinkExtractionResponse = await response.json();
    console.log('[Frontend] Server response:', result);
    console.log('[Frontend] Response data:', {
      hasData: !!result.data,
      hasSummary: !!result.data?.summary,
      summaryLength: result.data?.summary?.length || 0,
      hasTranscript: !!(result.data as any)?.transcript,
      transcriptLength: (result.data as any)?.transcript?.length || 0
    });

    if (!result.success || !result.data) {
      console.error('[Frontend] Invalid response structure:', result);
      throw new Error(result.error || 'Failed to extract link data');
    }

    return result.data;
  } catch (error: any) {
    console.error('[Frontend] Error in extractLinkData:', error);
    throw new Error(`Failed to extract link data: ${error.message}`);
  }
}

export interface AISearchResponse {
  success: boolean;
  matchingIds?: string[];
  error?: string;
}

/**
 * AI Search: Search items using Gemini AI
 * @param query - The search query/question
 * @param items - Array of items with id, title, and notes
 * @returns Array of matching item IDs
 */
export async function aiSearch(query: string, items: Array<{ id: string; title: string; notes: string | null }>): Promise<string[]> {
  try {
    console.log('[Frontend AI Search] Sending request to backend:', { query, itemsCount: items.length });
    const response = await fetch(`${BACKEND_URL}/api/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, items }),
    });

    console.log('[Frontend AI Search] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('[Frontend AI Search] Error response:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result: AISearchResponse = await response.json();
    console.log('[Frontend AI Search] Server response:', result);

    if (!result.success) {
      console.error('[Frontend AI Search] Invalid response structure:', result);
      throw new Error(result.error || 'Failed to perform AI search');
    }

    return result.matchingIds || [];
  } catch (error: any) {
    console.error('[Frontend AI Search] Error in aiSearch:', error);
    throw new Error(`Failed to perform AI search: ${error.message}`);
  }
}

