# SynapCity Frontend

React + Vite frontend application for the SynapCity knowledge management platform.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables Setup

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3001

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Required Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

**Optional Variables:**
- `VITE_BACKEND_URL` - Backend API URL (defaults to `http://localhost:3001`)

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in terminal).

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utility functions and API clients
│   ├── hooks/          # Custom React hooks
│   └── integrations/   # Supabase client configuration
└── supabase/
    └── migrations/     # Database migration files
```

## 🎯 Features

- **Dashboard**: View and search all saved items
- **Links Page**: Save web links with automatic metadata extraction
- **YouTube Page**: Save YouTube videos with AI-generated summaries
- **Insert Data**: Manually add items with custom fields
- **Item Details**: View complete item information
- **AI Search**: Semantic search powered by Gemini AI
- **Domain Filtering**: Filter items by domain

## 🔧 Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Run the database migrations from `supabase/migrations/`
4. Configure RLS policies (see `SUPABASE_SETUP_GUIDE.md`)

### Backend Integration

Ensure the backend server is running on the port specified in `VITE_BACKEND_URL`.

## 📦 Key Dependencies

- `react` - UI library
- `react-router-dom` - Routing
- `@supabase/supabase-js` - Supabase client
- `@tanstack/react-query` - Data fetching
- `shadcn-ui` - UI components
- `tailwindcss` - Styling
- `zod` - Schema validation

## 🐛 Troubleshooting

### Frontend won't start
- Verify Node.js version is 18+
- Run `npm install` to ensure all dependencies are installed
- Check for port conflicts

### Can't connect to backend
- Verify backend server is running
- Check `VITE_BACKEND_URL` in `.env`
- Review browser console for CORS errors

### Supabase connection issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Review browser console for authentication errors

### Build errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run type-check` (if available)

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

## 🔒 Security Notes

- Never commit `.env` files
- Keep Supabase keys secure
- Use environment variables for all sensitive data
- RLS policies are enforced at the database level
