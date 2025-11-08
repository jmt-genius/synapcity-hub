# SynapCity Chrome Extension

Chrome extension (Manifest V3) for quickly saving links, YouTube videos, and LinkedIn posts to your SynapCity database.

## 🚀 Installation

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `synapcity_extension` folder

### 2. Configuration

Before using the extension, configure your Supabase credentials:

1. Click the **SynapCity icon** in your toolbar
2. Go to the **Settings** tab
3. Click **Open Settings Page**
4. Enter the following:
   - **Supabase URL**: Your Supabase project URL
   - **Supabase Anon Key**: Your Supabase anonymous key
   - **Access Token**: Your Supabase access token (from authenticated session)
   - **User ID**: Your Supabase user UUID
5. Toggle **Automatic Saving** (optional):
   - **ON**: Saves directly without confirmation
   - **OFF**: Shows confirmation popup before saving
6. Click **Save Settings**

### 3. Get Access Token

To get your Supabase access token:

1. Sign in to your Supabase project
2. Open browser DevTools (F12)
3. Go to Application/Storage > Local Storage
4. Find `sb-<project-id>-auth-token`
5. Copy the `access_token` value

Alternatively, use the `GET_TOKEN.html` file included in the extension.

## 📖 Usage

### Saving Links

**Method 1: Context Menu**
- Right-click on any page or link
- Select **"Save to Synapcity"**
- Confirm if automatic saving is disabled

**Method 2: Keyboard Shortcut**
- Press `Ctrl+Shift+Y` (Windows/Linux) or `⌘+Shift+Y` (Mac)
- Saves immediately without confirmation

**Method 3: Extension Popup**
- Click the extension icon
- Confirm pending saves (if automatic saving is off)

### Supported Sources

- **YouTube**: Automatically extracts video title and thumbnail
- **LinkedIn**: Extracts post author and content
- **Generic Links**: Extracts page title and metadata

## 🔧 Configuration Files

### Environment Setup

The extension stores configuration in Chrome's `chrome.storage.sync`:

- `supabaseUrl` - Your Supabase project URL
- `supabaseAnonKey` - Your Supabase anonymous key
- `accessToken` - Your authenticated access token
- `userId` - Your user UUID
- `automaticSaving` - Boolean for auto-save preference

### Backend Integration (Optional)

To enable AI summarization for extension-saved items, update `background.js` to call your backend API:

```javascript
// In background.js, before saving:
const backendUrl = 'http://localhost:3001/api/extract-link';
const response = await fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
});
const data = await response.json();
// Include data.data.summary in itemData.notes
```

## 📁 Project Structure

```
synapcity_extension/
├── manifest.json      # Extension configuration
├── background.js       # Service worker (handles saves)
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── settings.html       # Settings page
├── settings.js         # Settings logic
├── content.js          # Content script (metadata extraction)
├── styles.css          # Shared styles
└── icons/              # Extension icons
```

## 🐛 Troubleshooting

### Extension won't load
- Verify all files are in the `synapcity_extension` folder
- Check `manifest.json` is valid JSON
- Review Chrome extension error page

### Can't save items
- Verify Supabase credentials are correct
- Check access token is valid and not expired
- Ensure User ID matches your authenticated user
- Review browser console for errors

### No metadata extracted
- Content script may not have permission for the site
- Check `manifest.json` permissions
- Verify content script is injected correctly

### Settings not saving
- Check Chrome storage permissions
- Verify settings page has proper event handlers
- Review browser console for errors

## 🔒 Security Notes

- Access tokens are stored in Chrome's sync storage
- Never share your Supabase credentials
- Tokens expire - you may need to refresh periodically
- Use RLS policies in Supabase to secure data access

## 📝 Database Schema

The extension saves to the `items` table:

```sql
CREATE TABLE public.items (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  source text NOT NULL,
  title text NOT NULL,
  url text,
  notes text,
  tags text[],
  metadata jsonb,
  image_path text,
  created_at timestamptz,
  updated_at timestamptz
);
```

## 🚀 Development

### Testing Changes

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click **Reload** on the extension card
4. Test the changes

### Debugging

- **Background Script**: Go to `chrome://extensions/` > Service Worker (for background.js)
- **Popup**: Right-click extension icon > Inspect popup
- **Content Script**: Use DevTools on the page where script runs

## 📄 License

[Your License Here]
