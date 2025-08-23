# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SubScout is a customer development platform for solo developers and indie hackers to discover, validate, and engage with potential customers through Reddit. The application analyzes app URLs, discovers relevant subreddits, monitors discussions for insights, and generates engagement strategies.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot reloading (runs both client and server)
- `npm run build` - Build for production (builds client with Vite and bundles server with esbuild)
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run vercel-build` - Vercel-specific build command

### Database Management
- Database schema is managed through Supabase migrations
- Use the Supabase dashboard or CLI to manage schema changes

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript, Wouter for routing, Tailwind CSS + shadcn/ui components
- **Backend**: Express.js with TypeScript, RESTful API design
- **Database**: PostgreSQL (Supabase) with Supabase client
- **Auth**: Supabase Authentication with React hooks
- **AI**: Google Gemini for app analysis and content generation, Perplexity for subreddit discovery
- **Build**: Vite for client, esbuild for server bundling
- **Deployment**: Vercel with serverless functions

### Project Structure
```
client/src/          # React frontend application
  components/        # Feature-specific React components
  components/ui/     # shadcn/ui component library
  pages/            # Main application pages (dashboard, subreddits, insights, posts)
  hooks/            # Custom React hooks (auth, mobile detection, toast)
  lib/              # Client utilities (auth, query client, utils)

server/             # Express.js backend
  index.ts          # Main server entry point
  routes.ts         # All API route definitions
  storage.ts        # Database operations layer
  db.ts             # Supabase client configuration
  gemini.ts         # Google Gemini AI integration
  perplexity.ts     # Perplexity AI integration for subreddit discovery
  reddit.ts         # Reddit API integration

lib/                # Shared configuration
  supabase.ts       # Supabase client configuration and types
```

### Key Design Patterns

**Shared Types**: Database types defined in `lib/supabase.ts` using Supabase's type generation, shared between client and server for type safety.

**Storage Layer**: Abstracted database operations in `server/storage.ts` provide a clean interface for all CRUD operations using Supabase client.

**Route Structure**: RESTful API endpoints organized by resource:
- `/api/auth/*` - Authentication endpoints
- `/api/apps/*` - App management and analysis
- `/api/subreddits/*` - Subreddit discovery and monitoring
- `/api/posts/*` - Post generation and management
- `/api/insights/*` - Pain point and trend analysis
- `/api/activities/*` - User activity logging

**Authentication Flow**: Supabase authentication provides secure user management with JWT tokens and React hooks integration.

**AI Integration Pattern**: Three AI services coordinated through modular functions:
- Google Gemini for app analysis and content generation
- Perplexity for subreddit discovery based on app characteristics
- Reddit API for real-time data enhancement and validation

### Database Schema

Core entities with relationships:
- **Profiles** - User profile data (extends Supabase auth.users)
- **Apps** - Analyzed applications with extracted metadata (target audience, pain points, features)
- **Subreddits** - Discovered communities with match scores and monitoring status
- **Insights** - Pain points and trends extracted from subreddit discussions
- **Posts** - Generated content for community engagement (draft → approved → published)
- **Activities** - User action audit log for tracking and analytics

### State Management

**Client State**: TanStack Query (React Query) for server state management with caching
**Authentication**: Custom `useAuth` hook wrapping Supabase's authentication state
**UI State**: React state with shadcn/ui components for consistent design system

### Environment Configuration

Required environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side)
- `VITE_SUPABASE_URL` - Supabase project URL (client-side)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (client-side)
- `GEMINI_API_KEY` - Google Gemini API access
- `PERPLEXITY_API_KEY` - Perplexity API access
- `REDDIT_CLIENT_ID` - Reddit API client ID
- `REDDIT_CLIENT_SECRET` - Reddit API client secret
- `FRONTEND_URL` - Frontend URL for CORS configuration (production)

### Development Notes

**ESM Modules**: Entire codebase uses ES modules with `.js` extensions in imports
**Type Safety**: Strict TypeScript configuration with path aliases (`@/` for client, `@shared/` for shared code)
**Build Process**: Client built with Vite, server bundled with esbuild for production
**Deployment**: Configured for Vercel with serverless functions and static hosting
**Error Handling**: Centralized error handling with structured logging and user-friendly messages

### Deployment Notes

**Vercel Configuration**: 
- Static frontend served from `dist/public`
- API routes handled by serverless function at `server/index.ts`
- Environment variables configured in Vercel dashboard
- CORS configured for production domain

**Database**: Supabase provides PostgreSQL with built-in authentication and real-time capabilities
**Authentication**: Supabase handles user management, session tokens, and Row Level Security