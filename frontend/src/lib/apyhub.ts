/**
 * ApyHub Link Preview API utility
 * Documentation: https://apyhub.com/utility/link-preview
 */

interface LinkPreviewResponse {
  data: {
    url: string;
    title?: string;
    siteName?: string;
    description?: string;
    mediaType?: string;
    contentType?: string;
    images?: string[];
    videos?: string[];
    favicons?: string[];
    reported_malicious?: boolean;
    threat?: string;
  };
}

interface LinkPreviewError {
  error: {
    code: number;
    message: string;
  };
}

export async function fetchLinkPreview(url: string): Promise<LinkPreviewResponse['data']> {
  const apiToken = import.meta.env.VITE_APYHUB_TOKEN;
  
  if (!apiToken) {
    throw new Error("ApyHub API token is not configured. Please set VITE_APYHUB_TOKEN in your environment variables.");
  }

  try {
    const response = await fetch('https://api.apyhub.com/extract/url/preview', {
      method: 'POST',
      headers: {
        'apy-token': apiToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        secure_mode: true,
        allow_redirects: true,
      }),
    });

    if (!response.ok) {
      const errorData: LinkPreviewError = await response.json();
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data: LinkPreviewResponse = await response.json();
    
    // Check if URL is reported as malicious
    if (data.data.reported_malicious) {
      throw new Error(`URL is reported as malicious: ${data.data.threat || 'unknown threat'}`);
    }

    return data.data;
  } catch (error: any) {
    if (error.message.includes('malicious')) {
      throw error;
    }
    throw new Error(`Failed to fetch link preview: ${error.message}`);
  }
}

