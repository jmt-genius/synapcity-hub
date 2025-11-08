# SynapCity Hub

A comprehensive knowledge management platform that allows users to save, organize, and search through links, YouTube videos, LinkedIn posts, and manual entries. Features AI-powered summarization and semantic search capabilities.

## 🚀 Features

- **Link Management**: Save and organize web links with automatic metadata extraction
- **YouTube Integration**: Extract video summaries, titles, and tags using Gemini AI
- **AI-Powered Search**: Semantic search across your saved content using Gemini AI
- **Chrome Extension**: Quick save functionality directly from your browser
- **Smart Summarization**: Automatic content summarization using Claude and Gemini APIs
- **Domain Filtering**: Filter saved items by domain
- **Item Details**: View complete item information with full notes and metadata

## 📁 Project Structure

```
synapcity-hub/
├── backend/          # Express.js backend server
├── frontend/         # React + Vite frontend application
└── synapcity_extension/  # Chrome extension
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- API keys for:
  - Claude API (via LiteLLM proxy)
  - Gemini API (for YouTube videos)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synapcity-hub
   ```

2. **Set up Backend**
   ```bash
   cd backend
   npm install
   # See backend/README.md for .env setup
   npm run dev
   ```

3. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   # See frontend/README.md for .env setup
   npm run dev
   ```

4. **Set up Chrome Extension**
   ```bash
   # See synapcity_extension/README.md for setup instructions
   ```

5. **Set up Supabase Database**
   - Run the SQL migrations from `frontend/supabase/migrations/`
   - See `SUPABASE_SETUP_GUIDE.md` for detailed instructions

## 📚 Documentation

- [Backend Setup](./backend/README.md) - Backend server configuration and API endpoints
- [Frontend Setup](./frontend/README.md) - Frontend application setup and configuration
- [Extension Setup](./synapcity_extension/README.md) - Chrome extension installation and configuration
- [Supabase Setup](./SUPABASE_SETUP_GUIDE.md) - Database schema and RLS policies

## 🔧 Environment Variables

Each component requires its own `.env` file:

- **Backend**: See `backend/README.md` for required variables
- **Frontend**: See `frontend/README.md` for required variables
- **Extension**: See `synapcity_extension/README.md` for configuration

## 🏃 Running the Application

1. Start the backend server (port 3001)
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application at `http://localhost:5173` (or the port shown in terminal)

## 🧪 Testing

- Backend health check: `http://localhost:3001/health`
- Test link extraction: POST to `http://localhost:3001/api/extract-link`

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

