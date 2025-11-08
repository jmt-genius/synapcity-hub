// popup.js

const confirmationView = document.getElementById('confirmation-view');
const mainView = document.getElementById('main-view');
const saveStatusMessage = document.getElementById('save-status-message');

// --- Tab Switching Logic ---
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.dataset.tab;

        // Deactivate all tabs and buttons
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the clicked tab and button
        button.classList.add('active');
        document.getElementById(tabId + '-tab').classList.add('active');
    });
});

// --- Confirmation Dialog Logic ---

/**
 * Renders the confirmation dialog for a pending save.
 * @param {object} pendingSave - The object containing url, title, and source.
 */
function renderConfirmationDialog(pendingSave) {
    mainView.style.display = 'none';
    confirmationView.style.display = 'block';

    const { url, title, source } = pendingSave;

    const dialogHTML = `
        <div class="confirmation-dialog">
            <h2>Do you want to save this to Synapcity?</h2>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Source:</strong> ${source.charAt(0).toUpperCase() + source.slice(1)}</p>
            <div class="button-group">
                <button id="yes-button" class="button button-primary">Yes</button>
                <button id="no-button" class="button button-secondary">No</button>
            </div>
        </div>
    `;
    confirmationView.innerHTML = dialogHTML;

    document.getElementById('yes-button').addEventListener('click', () => handleConfirmation(true, pendingSave));
    document.getElementById('no-button').addEventListener('click', () => handleConfirmation(false));
}

/**
 * Handles the user's confirmation choice.
 * @param {boolean} confirmed - True if 'Yes', False if 'No'.
 * @param {object} pendingSave - The object to save (only if confirmed).
 */
async function handleConfirmation(confirmed, pendingSave) {
    if (confirmed) {
        // Send message to background script to perform the save
        const response = await chrome.runtime.sendMessage({
            action: "saveConfirmed",
            data: pendingSave
        });

        // Update status message based on save result
        const statusClass = response.success ? 'status-success' : 'status-error';
        saveStatusMessage.className = `status-message ${statusClass}`;
        saveStatusMessage.textContent = response.message;

    } else {
        // Clear the pending save state
        await chrome.storage.local.remove('pendingSave');
        saveStatusMessage.className = 'status-message status-info';
        saveStatusMessage.textContent = 'Save cancelled.';
    }

    // Switch back to the main view
    confirmationView.style.display = 'none';
    mainView.style.display = 'block';
    loadLastSaveStatus(); // Reload status to show the latest action
}

// --- Status Loading Logic ---

/**
 * Loads and displays the last save status from storage.
 */
async function loadLastSaveStatus() {
    const response = await chrome.runtime.sendMessage({ action: "getLastSaveStatus" });
    const { lastSaveStatus, lastSaveSuccess } = response;

    if (lastSaveStatus) {
        const statusClass = lastSaveSuccess ? 'status-success' : 'status-error';
        saveStatusMessage.className = `status-message ${statusClass}`;
        saveStatusMessage.textContent = lastSaveStatus;
    } else {
        saveStatusMessage.className = 'status-message status-info';
        saveStatusMessage.textContent = 'No save history found.';
    }
}

// --- Initialization ---

/**
 * Main initialization function.
 */
async function init() {
    // 1. Check for pending save confirmation
    const pendingSave = await chrome.runtime.sendMessage({ action: "getPendingSave" });

    if (pendingSave) {
        renderConfirmationDialog(pendingSave);
    } else {
        // 2. If no pending save, show main view and load status
        mainView.style.display = 'block';
        confirmationView.style.display = 'none';
        loadLastSaveStatus();
    }
}

init();
