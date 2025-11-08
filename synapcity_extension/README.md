# Synapcity Link Saver Chrome Extension

This is a Manifest V3 Chrome extension designed to quickly save links from YouTube, LinkedIn, and generic web pages to a user's private Supabase database. It features a dark-themed user interface, a keyboard shortcut for instant saving, a context menu option, and a settings page for Supabase configuration and automatic saving control.

## 1. Project Structure

The extension follows a modular structure:

\`\`\`
synapcity_extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background.js           # Service Worker: Handles context menu, commands, Supabase logic, and communication
├── popup.html              # The main popup UI (confirmation dialog and tabs)
├── popup.js                # Logic for the popup UI
├── settings.html           # The dedicated settings page
├── settings.js             # Logic for the settings page
├── styles.css              # Shared dark-theme CSS styles
├── content.js              # Content script for metadata extraction on YouTube/LinkedIn
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
\`\`\`

## 2. Installation and Loading

To load this extension in Google Chrome or a Chromium-based browser:

1.  **Download and Unzip:** Ensure you have the \`synapcity_extension\` folder containing all the files.
2.  **Open Extensions Page:** Navigate to \`chrome://extensions\` in your browser.
3.  **Enable Developer Mode:** Toggle the "Developer mode" switch, usually located in the top right corner.
4.  **Load Unpacked:** Click the "Load unpacked" button.
5.  **Select Folder:** Select the entire \`synapcity_extension\` folder.

The extension should now appear in your list of extensions and its icon will be visible in the toolbar.

## 3. Usage and Features

### Settings Configuration

Before saving any links, you must configure your Supabase credentials:

1.  Click the **Synapcity icon** in your toolbar to open the popup.
2.  Click the **Settings** tab.
3.  Click **Open Settings Page** to open the dedicated options page.
4.  Enter your **Supabase URL**, **Supabase Anon Key**, and your **User ID** (UUID).
5.  **Automatic Saving Toggle:**
    *   **Enabled:** The extension will bypass the confirmation popup and save links directly when using the context menu or a content script "Save" button (if implemented).
    *   **Disabled:** A confirmation popup will appear when saving via the context menu, asking "Do you want to save this to Synapcity?".
6.  Click **Save Settings**.

### Saving Links

The extension supports three primary ways to save a link:

| Method | Action | Behavior |
| :--- | :--- | :--- |
| **Context Menu** | Right-click on a page or link and select **"Save to Synapcity"**. | Opens the confirmation popup (if automatic saving is off) or saves directly (if automatic saving is on). |
| **Keyboard Shortcut** | Press **\`Ctrl+Shift+Y\`** (Windows/Linux) or **\`⌘+Shift+Y\`** (Mac). | **Always saves the current tab's URL directly** without any popup interaction. |
| **Popup Confirmation** | Click the extension icon after a context menu save (if automatic saving is off). | Allows the user to confirm or cancel the save action. |

### Bookmarks / Shortcuts Tab

This tab displays the status of the **last save attempt** and reminds the user of the keyboard shortcut.

## 4. Supabase Schema and Integration

The extension uses the Supabase JavaScript client (via CDN) to insert data into the \`public.items\` table.

### Database Schema

\`\`\`sql
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL CHECK (source IN ('youtube', 'linkedin', 'link', 'manual')),
  title text NOT NULL,
  url text,
  notes text,
  tags text[],
  metadata jsonb,
  image_path text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
\`\`\`

### Metadata Extraction Logic

The \`content.js\` script is injected into YouTube and LinkedIn pages to extract additional metadata, which is stored in the \`metadata\` (JSONB) and \`image_path\` (TEXT) fields:

| Source | \`source\` Field | Extracted Metadata |
| :--- | :--- | :--- |
| **YouTube** | \`'youtube'\` | \`metadata\`: Page title, \`image_path\`: YouTube thumbnail URL. |
| **LinkedIn Post** | \`'linkedin'\` | \`metadata\`: Author name, post text, \`image_path\`: Image preview URL. |
| **Generic Link** | \`'link'\` | \`metadata\`: Page title. |

## 5. Dark Theme Design Guidance

The extension uses a consistent dark theme defined in \`styles.css\`:

| Element | Color/Style | CSS Variable |
| :--- | :--- | :--- |
| **Background** | Dark Gray | \`--color-bg-primary: #1e1e1e\` |
| **Secondary BG** | Slightly Lighter Dark Gray | \`--color-bg-secondary: #2d2d2d\` |
| **Primary Text** | Off-White | \`--color-text-primary: #f0f0f0\` |
| **Accent Color** | Violet/Purple | \`--color-accent: #8a2be2\` |
| **Primary Button** | Accent Color | \`.button-primary\` |
| **Success Status** | Green Tint | \`.status-success\` |
| **Error Status** | Red Tint | \`.status-error\` |

This color palette ensures high contrast and a modern, dark aesthetic across the popup and settings pages.

## 6. Sample Test Cases

To verify the extension's functionality, perform the following tests:

1.  **Test 1: Generic Link (Automatic Saving OFF)**
    *   **Pre-condition:** Automatic saving is disabled in settings.
    *   **Action:** Right-click on any non-YouTube/non-LinkedIn page and select "Save to Synapcity".
    *   **Expected Result:** The extension popup opens, showing the confirmation dialog: "Do you want to save this to Synapcity?" with the page title and source 'Link'. Clicking "Yes" should result in a successful save notification and a new entry in your Supabase \`items\` table.

2.  **Test 2: YouTube Link (Automatic Saving ON)**
    *   **Pre-condition:** Automatic saving is enabled in settings.
    *   **Action:** Navigate to a YouTube video page and press the keyboard shortcut (\`Ctrl+Shift+Y\` or \`⌘+Shift+Y\`).
    *   **Expected Result:** A desktop notification appears immediately with a success message. No popup is shown. The Supabase entry should have \`source: 'youtube'\`, the video title, and the thumbnail URL in \`image_path\`.

3.  **Test 3: LinkedIn Post (Direct Save via Shortcut)**
    *   **Pre-condition:** Settings are configured.
    *   **Action:** Navigate to a LinkedIn post URL and press the keyboard shortcut.
    *   **Expected Result:** A desktop notification appears. The Supabase entry should have \`source: 'linkedin'\` and the \`metadata\` field should contain the extracted author and post text.

4.  **Test 4: Settings Persistence**
    *   **Action:** Change the "Automatic saving" toggle and click "Save Settings" on the settings page. Close and re-open the settings page.
    *   **Expected Result:** The toggle state should persist and reflect the last saved value.

5.  **Test 5: Missing Credentials**
    *   **Action:** Clear the Supabase URL in the settings and try to save a link.
    *   **Expected Result:** A desktop notification appears with an error message prompting the user to set their Supabase credentials. The save should fail.
