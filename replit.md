# Overview

SubScout is a customer development platform designed for solo developers and indie hackers to discover, validate, and engage with potential customers by leveraging Reddit as a primary customer discovery channel. The application automates subreddit discovery, surfaces user pain points, and generates engagement strategies to help developers validate their product ideas and find product-market fit.

The platform allows users to analyze their app's URL to extract key information about target audiences, discover relevant subreddits where potential customers gather, monitor discussions for insights, and generate draft posts for community engagement.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Wouter** for client-side routing instead of React Router
- **Tailwind CSS** with **shadcn/ui** component library for styling
- **TanStack Query (React Query)** for server state management and caching
- **Vite** as the build tool and development server

## Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with organized route handlers
- **Replit Authentication** integration using OpenID Connect for user management
- **Session-based authentication** with PostgreSQL session storage
- **Modular storage layer** with defined interfaces for data operations

## Database Design
- **PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations with schema validation
- **Neon Database** as the serverless PostgreSQL provider
- Key entities: Users, Apps, Subreddits, Insights, Posts, Activities, and Sessions
- **JSON columns** for storing arrays of pain points, features, and tags

## AI Integration
- **OpenAI GPT-4** integration for:
  - App URL analysis to extract purpose and target audience
  - Subreddit discovery based on customer profiles
  - Post generation for community engagement
  - Pain point trend analysis from discussions

## Authentication & Authorization
- **Replit Auth** with OpenID Connect for seamless authentication
- **Express sessions** with PostgreSQL storage for session persistence
- **Passport.js** strategy for authentication middleware
- Protected API routes with authentication checks

## Development & Deployment
- **ESM modules** throughout the application
- **TypeScript** for type safety across frontend and backend
- **Shared schema** between client and server using Drizzle and Zod
- **Development hot reloading** with Vite middleware integration
- **Production build** process with esbuild for server bundling

# External Dependencies

## Database & Storage
- **Neon Database** - Serverless PostgreSQL hosting
- **connect-pg-simple** - PostgreSQL session store for Express

## AI Services
- **OpenAI API** - GPT-4 for content analysis and generation

## Authentication
- **Replit Authentication** - OpenID Connect provider for user authentication

## UI Components & Styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Development Tools
- **Vite** - Build tool and development server
- **TypeScript** - Type system
- **Drizzle Kit** - Database migration tool
- **ESBuild** - JavaScript bundler for production builds