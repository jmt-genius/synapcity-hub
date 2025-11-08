// background.js (Service Worker)

// --- Supabase Client Implementation ---
// Using REST API directly instead of importScripts to avoid CSP issues in Manifest V3

/**
 * Saves the link data to the Supabase database using REST API.
 * @param {object} itemData The data object to save.
 * @returns {object} The result of the save operation.
 */
async function saveLinkToSupabase(itemData) {
    try {
        const settings = await chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'accessToken']);
        
        if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
            throw new Error("Supabase URL or Anon Key is missing.");
        }
        
        if (!settings.accessToken) {
            throw new Error("Access Token is missing. Please sign in and provide your access token in settings.");
        }

        // Use Supabase REST API directly with authenticated access token
        // The access token allows auth.uid() to work in RLS policies
        const response = await fetch(`${settings.supabaseUrl}/rest/v1/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': settings.supabaseAnonKey,
                'Authorization': `Bearer ${settings.accessToken}`, // Use access token, not anon key
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("Supabase insert error:", errorData);
            return { success: false, message: `Failed to save: ${errorData.message || response.statusText}` };
        }

        const data = await response.json();
        console.log("Supabase insert success:", data);
        return { success: true, message: `Successfully saved: ${itemData.title}` };

    } catch (e) {
        console.error("Supabase client error:", e);
        return { success: false, message: `Failed to save: ${e.message}` };
    }
}

// --- Helper Functions ---

/**
 * Detects the source type (youtube, linkedin, link) from a URL.
 * @param {string} url The URL to check.
 * @returns {string} The detected source.
 */
function detectSource(url) {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return "youtube";
    }
    // LinkedIn post URLs are typically like: https://www.linkedin.com/feed/update/urn:li:activity:7130691901234567890/
    // or https://www.linkedin.com/posts/author-name-12345_post-title-12345
    if (url.includes("linkedin.com/posts/") || url.includes("linkedin.com/feed/update/")) {
        return "linkedin";
    }
    return "link";
}

/**
 * Handles the saving process, either directly or via the popup.
 * @param {string} url The URL to save.
 * @param {string} title The title of the page.
 * @param {string} source The detected source type.
 * @param {boolean} forceSave If true, bypasses the automatic saving check and saves directly.
 */
/**
 * Executes the content script to extract metadata from the active tab.
 * @param {number} tabId The ID of the active tab.
 * @returns {object} The extracted metadata.
 */
async function getMetadataFromContentScript(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
        // The content script sends a message back, so we need to listen for it.
        // For simplicity and to avoid race conditions, we'll use a promise-based listener here.
        return new Promise((resolve) => {
            const listener = (request, sender, sendResponse) => {
                if (request.action === "metadataExtracted" && sender.tab.id === tabId) {
                    chrome.runtime.onMessage.removeListener(listener);
                    resolve(request.data);
                }
            };
            chrome.runtime.onMessage.addListener(listener);
        });
    } catch (e) {
        console.error("Error executing content script:", e);
        return {};
    }
}

/**
 * Handles the saving process, either directly or via the popup.
 * @param {string} url The URL to save.
 * @param {string} title The title of the page.
 * @param {string} source The detected source type.
 * @param {number} tabId The ID of the tab.
 * @param {boolean} forceSave If true, bypasses the automatic saving check and saves directly.
 */
async function handleSave(url, title, source, tabId, forceSave = false) {
    const settings = await chrome.storage.sync.get(['automaticSaving', 'supabaseUrl', 'supabaseAnonKey', 'accessToken', 'userId']);
    const automaticSaving = settings.automaticSaving === true;

    if (!settings.supabaseUrl || !settings.supabaseAnonKey || !settings.accessToken || !settings.userId) {
        const message = "Please set your Supabase credentials, Access Token, and User ID in the extension settings.";
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Synapcity Save Error',
            message: message,
            priority: 2
        });
        chrome.storage.local.set({ lastSaveStatus: message, lastSaveSuccess: false });
        return { success: false, message: message };
    }

    // Extract metadata using the content script
    const metadata = await getMetadataFromContentScript(tabId);
    
    // Determine the final title from metadata or fallback
    const finalTitle = metadata.title || title;

    if (automaticSaving || forceSave) {
        // Direct save logic
        const itemData = {
            url: url,
            title: finalTitle,
            source: source,
            user_id: settings.userId,
            metadata: metadata,
            image_path: metadata.image_path || null
        };
        
        const result = await saveLinkToSupabase(itemData);

        // Notify the user of the result
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Synapcity Save Status',
            message: result.message,
            priority: 2
        });

        // Update the status in storage for the Bookmarks/Shortcuts tab
        chrome.storage.local.set({ lastSaveStatus: result.message, lastSaveSuccess: result.success });
        return result;

    } else {
        // If automatic saving is off, and it's not a forceSave, set pending save for popup confirmation.
        await chrome.storage.local.set({
            pendingSave: { url, title: finalTitle, source, tabId }
        });
        // No return value needed as the save is pending confirmation in the popup.
    }
}

// --- Event Listeners ---

// 1. Context Menu
chrome.runtime.onInstalled.addListener(() => {
    // Create a context menu item for saving the link
    chrome.contextMenus.create({
        id: "saveToSynapcity",
        title: "Save to Synapcity",
        contexts: ["page", "link"] // 'page' for current page, 'link' for a link on the page
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "saveToSynapcity") {
        // info.linkUrl is available if the user right-clicked a link
        // tab.url is the current page URL
        const url = info.linkUrl || tab.url;
        const title = tab.title;
        const source = detectSource(url);

        // The context menu click should trigger the save flow.
        // If automatic saving is off, it sets the pendingSave state for the popup.
        // If automatic saving is on, it saves directly.
        await handleSave(url, title, source, tab.id);
    }
});

// 2. Keyboard Shortcut (Command)
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "save-current-tab") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            const url = tab.url;
            const title = tab.title;
            const source = detectSource(url);

            // Keyboard shortcut is an immediate save action, so we forceSave=true
            await handleSave(url, title, source, tab.id, true);
        }
    }
});

// 3. Message Listener for Popup/Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "saveConfirmed") {
        // This message comes from the popup when the user clicks "Yes"
        const { url, title, source, tabId } = request.data;
        // Clear the pending save state
        chrome.storage.local.remove('pendingSave');
        // Force the save
        handleSave(url, title, source, tabId, true).then(sendResponse);
        return true; // Indicates that the response is sent asynchronously
    } else if (request.action === "getSettings") {
        // Used by popup/settings page to get configuration
        chrome.storage.sync.get(['automaticSaving', 'supabaseUrl', 'supabaseAnonKey', 'userId'], (settings) => {
            sendResponse(settings);
        });
        return true;
    } else if (request.action === "getLastSaveStatus") {
        // Used by the Bookmarks/Shortcuts tab in the popup
        chrome.storage.local.get(['lastSaveStatus', 'lastSaveSuccess'], (status) => {
            sendResponse(status);
        });
        return true;
    } else if (request.action === "getPendingSave") {
        // Used by the popup to check if a confirmation is needed
        chrome.storage.local.get('pendingSave', (data) => {
            sendResponse(data.pendingSave);
        });
        return true;
    }
});
