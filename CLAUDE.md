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
- `npm run db:push` - Push database schema changes to Neon Database using Drizzle Kit
- Database migrations are managed through Drizzle Kit and stored in `./migrations/`

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript, Wouter for routing, Tailwind CSS + shadcn/ui components
- **Backend**: Express.js with TypeScript, RESTful API design
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM
- **Auth**: Clerk Authentication with React SDK and Express middleware
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
  db.ts             # Database connection and configuration
  gemini.ts         # OpenAI/Gemini AI integration
  perplexity.ts     # Perplexity AI integration for subreddit discovery
  reddit.ts         # Reddit API integration
  clerkAuth.ts      # Clerk authentication setup and middleware

shared/             # Code shared between client and server
  schema.ts         # Database schema with Drizzle ORM and Zod validation
```

### Key Design Patterns

**Shared Schema**: Database schema defined once in `shared/schema.ts` using Drizzle ORM with Zod validation, shared between client and server for type safety.

**Storage Layer**: Abstracted database operations in `server/storage.ts` provide a clean interface for all CRUD operations.

**Route Structure**: RESTful API endpoints organized by resource:
- `/api/auth/*` - Authentication endpoints
- `/api/apps/*` - App management and analysis
- `/api/subreddits/*` - Subreddit discovery and monitoring
- `/api/posts/*` - Post generation and management
- `/api/insights/*` - Pain point and trend analysis
- `/api/activities/*` - User activity logging

**Authentication Flow**: Clerk authentication provides secure user management with JWT tokens and React SDK integration.

**AI Integration Pattern**: Three AI services coordinated through modular functions:
- Google Gemini for app analysis and content generation
- Perplexity for subreddit discovery based on app characteristics
- Reddit API for real-time data enhancement and validation

### Database Schema

Core entities with relationships:
- **Users** - Clerk authenticated users (ID serves as primary key)
- **Apps** - Analyzed applications with extracted metadata (target audience, pain points, features)
- **Subreddits** - Discovered communities with match scores and monitoring status
- **Insights** - Pain points and trends extracted from subreddit discussions
- **Posts** - Generated content for community engagement (draft → approved → published)
- **Activities** - User action audit log for tracking and analytics

### State Management

**Client State**: TanStack Query (React Query) for server state management with caching
**Authentication**: Custom `useAuth` hook wrapping Clerk's authentication state
**UI State**: React state with shadcn/ui components for consistent design system

### Environment Configuration

Required environment variables:
- `DATABASE_URL` - Neon Database connection string
- `GEMINI_API_KEY` - Google Gemini API access
- `PERPLEXITY_API_KEY` - Perplexity API access
- `REDDIT_CLIENT_ID` - Reddit API client ID
- `REDDIT_CLIENT_SECRET` - Reddit API client secret
- `CLERK_SECRET_KEY` - Clerk backend authentication
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk frontend authentication
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

**Database**: Neon Database provides serverless PostgreSQL with automatic scaling
**Authentication**: Clerk handles user management, session tokens, and security