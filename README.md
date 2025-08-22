# SubScout

Customer development platform for solo developers and indie hackers to discover, validate, and engage with potential customers through Reddit.

## Features

- **App Analysis**: AI-powered analysis of your app to identify target customer personas
- **Subreddit Discovery**: Find relevant Reddit communities where your customers gather
- **Pain Point Monitoring**: Extract insights from community discussions
- **Engagement Generation**: AI-drafted posts for authentic community engagement

## Tech Stack

- **Frontend**: React 18 + TypeScript, Wouter routing, Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript, RESTful API
- **Database**: PostgreSQL (Neon Database) with Drizzle ORM
- **Auth**: Clerk Authentication
- **AI**: Google Gemini for content generation, Perplexity for subreddit discovery
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Clerk account and API keys
- Neon Database instance
- Google Gemini API key
- Perplexity API key
- Reddit API credentials

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=postgresql://...

# AI Services
PERPLEXITY_API_KEY=pplx-...
GEMINI_API_KEY=AIzaSy...

# Reddit API
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

### Development

1. Install dependencies:
```bash
npm install
```

2. Push database schema:
```bash
npm run db:push
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

### Deployment

The project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

## Project Structure

```
client/src/          # React frontend
  components/        # Feature components
  components/ui/     # shadcn/ui components
  pages/            # Main application pages
  hooks/            # Custom React hooks
  lib/              # Client utilities

server/             # Express.js backend
  index.ts          # Main server entry
  routes.ts         # API route definitions
  storage.ts        # Database operations
  clerkAuth.ts      # Authentication middleware
  gemini.ts         # OpenAI integration
  perplexity.ts     # Perplexity AI integration
  reddit.ts         # Reddit API integration

shared/             # Shared code
  schema.ts         # Database schema
```

## API Documentation

### Authentication
All API routes require authentication via Clerk JWT tokens.

### Core Endpoints
- `POST /api/apps` - Analyze app URL
- `GET /api/apps` - List user's apps
- `POST /api/apps/:appId/subreddits/discover` - Discover subreddits
- `POST /api/posts/generate` - Generate engagement posts
- `GET /api/insights/pain-points` - Get pain point insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License