// settings.js

const form = document.getElementById('settings-form');
const supabaseUrlInput = document.getElementById('supabase-url');
const supabaseAnonKeyInput = document.getElementById('supabase-anon-key');
const accessTokenInput = document.getElementById('access-token');
const userIdInput = document.getElementById('user-id');
const automaticSavingToggle = document.getElementById('automatic-saving');
const saveStatusDiv = document.getElementById('save-status');

/**
 * Displays a status message to the user.
 * @param {string} message The message to display.
 * @param {string} type The type of message ('success' or 'error').
 */
function showStatus(message, type) {
    saveStatusDiv.textContent = message;
    saveStatusDiv.className = `save-status status-${type}`;
    setTimeout(() => {
        saveStatusDiv.textContent = '';
        saveStatusDiv.className = 'save-status';
    }, 3000);
}

/**
 * Loads the saved settings from chrome.storage.sync and populates the form.
 */
function loadSettings() {
    chrome.storage.sync.get(['supabaseUrl', 'supabaseAnonKey', 'accessToken', 'automaticSaving', 'userId'], (items) => {
        supabaseUrlInput.value = items.supabaseUrl || '';
        supabaseAnonKeyInput.value = items.supabaseAnonKey || '';
        accessTokenInput.value = items.accessToken || '';
        userIdInput.value = items.userId || '';
        automaticSavingToggle.checked = items.automaticSaving || false;
    });
}

/**
 * Saves the form data to chrome.storage.sync.
 * @param {Event} e The form submission event.
 */
function saveSettings(e) {
    e.preventDefault();

    const settings = {
        supabaseUrl: supabaseUrlInput.value.trim(),
        supabaseAnonKey: supabaseAnonKeyInput.value.trim(),
        accessToken: accessTokenInput.value.trim(),
        userId: userIdInput.value.trim(),
        automaticSaving: automaticSavingToggle.checked
    };

    chrome.storage.sync.set(settings, () => {
        if (chrome.runtime.lastError) {
            showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
        } else {
            showStatus('Settings saved successfully!', 'success');
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
form.addEventListener('submit', saveSettings);
