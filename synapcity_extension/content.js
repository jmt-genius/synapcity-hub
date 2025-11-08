// content.js

/**
 * Extracts metadata from the current page based on the domain.
 * @returns {object} An object containing the extracted metadata.
 */
function extractMetadata() {
    const url = window.location.href;
    const metadata = {};

    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        // YouTube extraction
        // Use document.title as a fallback for the title
        const title = document.title;
        
        // Simple way to get the video ID
        const videoIdMatch = url.match(/(?:v=|\/embed\/|\/v\/|youtu\.be\/|\/e\/|watch\?v=|\/watch\?v=|&v=)([^#\&\?]*).*/);
        const videoId = videoIdMatch && videoIdMatch[1].length === 11 ? videoIdMatch[1] : null;

        if (videoId) {
            // High quality thumbnail URL
            metadata.image_path = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }

        metadata.title = title;
        metadata.page_title = document.title; // Keep original page title for reference

    } else if (url.includes("linkedin.com/posts/") || url.includes("linkedin.com/feed/update/")) {
        // LinkedIn post extraction
        
        // Author Name (often in a link with a specific class)
        const authorElement = document.querySelector('.update-components-actor__name');
        metadata.author = authorElement ? authorElement.textContent.trim() : null;

        // Post Text (the main content of the post)
        const postTextElement = document.querySelector('.update-components-text');
        metadata.post_text = postTextElement ? postTextElement.textContent.trim() : null;

        // Image Preview (looking for a common image container)
        const imageElement = document.querySelector('.update-components-image img');
        metadata.image_path = imageElement ? imageElement.src : null;

        metadata.title = document.title;

    } else {
        // Generic link
        metadata.title = document.title;
    }

    return metadata;
}

// Send the extracted metadata back to the background script
chrome.runtime.sendMessage({
    action: "metadataExtracted",
    data: extractMetadata()
});
