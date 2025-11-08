/**
 * Utility functions for URL and domain operations
 */

/**
 * Extracts the domain name from a URL
 * @param url - The URL to extract domain from
 * @returns The domain name (e.g., "example.com") or null if invalid
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    
    // Remove 'www.' prefix if present
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts unique domains from an array of items that have URLs
 * @param items - Array of items with optional url field
 * @returns Array of unique domain names, sorted alphabetically
 */
export function extractUniqueDomains<T extends { url: string | null }>(
  items: T[]
): string[] {
  const domains = new Set<string>();
  
  items.forEach((item) => {
    if (item.url) {
      const domain = extractDomain(item.url);
      if (domain) {
        domains.add(domain);
      }
    }
  });
  
  return Array.from(domains).sort();
}

