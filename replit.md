# Tokenized Share Platform

## Overview

This is a full-stack web application for tokenizing NSE (National Stock Exchange) listed shares. The platform "Tokenized Share" with tagline "Share Tokenization and Trading Platform" allows users to convert their physical shares into digital tokens and vice versa, enabling enhanced liquidity and seamless trading of tokenized assets. Built with Express.js backend, React frontend, PostgreSQL database with Drizzle ORM, and integrated with Replit authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and build processes
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints
- **Authentication**: Replit OpenID Connect integration with session management
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Database Architecture
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Schema Location**: Shared between client and server (`shared/schema.ts`)
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- Uses Replit's OpenID Connect (OIDC) for user authentication
- Session-based authentication with PostgreSQL session storage
- Automatic token refresh and user session management
- Protected routes with authentication middleware

### Data Models
- **Users**: User profiles with KYC status and investor IDs
- **Companies**: NSE-listed companies with real-time pricing
- **Holdings**: Traditional share holdings by users
- **TokenizedShares**: Digital tokens representing physical shares
- **Orders**: Buy/sell orders for tokenized shares
- **Transactions**: Complete transaction history
- **Sessions**: Authentication session storage

### Core Features
1. **Share Tokenization**: Convert physical shares to digital tokens
2. **Token Trading**: Buy and sell tokenized shares
3. **Token Conversion**: Convert tokens back to physical shares
4. **Portfolio Management**: View holdings and performance
5. **Transaction History**: Complete audit trail
6. **Wallet Management**: Fund management with CBDC integration
7. **CBDC Integration**: Central Bank Digital Currency wallet connectivity

### UI Components
- Responsive design with mobile-first approach
- Modular component structure using shadcn/ui
- Custom modals for tokenization, trading, and conversion
- Real-time data updates using React Query
- Interactive charts for portfolio visualization
- Comprehensive settings menu with security, payment, and appearance options

## Data Flow

1. **Authentication Flow**: Replit OIDC → Session creation → User profile creation/retrieval
2. **Tokenization Flow**: Share holdings → Validation → Token creation → Holding adjustment
3. **Trading Flow**: Order placement → Matching → Transaction creation → Balance updates
4. **Conversion Flow**: Token holdings → Validation → Share creation → Token burning

## External Dependencies

### Authentication
- **Replit OIDC**: Primary authentication provider
- **OpenID Client**: For OIDC protocol implementation
- **Passport.js**: Authentication middleware

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session store

### Frontend Libraries
- **TanStack Query**: Server state management and caching
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Chart.js**: Data visualization
- **Wouter**: Lightweight routing

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Static type checking
- **ESBuild**: Production bundling
- **Tailwind CSS**: Utility-first styling

## Deployment Strategy

### Development
- Vite dev server for frontend with hot reload
- TSX for running TypeScript backend in development
- Shared type definitions between client and server
- Environment-based configuration

### Production
- Vite build for optimized frontend bundle
- ESBuild for backend bundling with external dependencies
- Static file serving from Express
- PostgreSQL connection pooling for scalability

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit application identifier
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)
- `REPLIT_DOMAINS`: Allowed domains for OIDC

### File Structure
- `client/`: React frontend application
- `server/`: Express backend API
- `shared/`: Common schemas and types
- `dist/`: Production build output
- `migrations/`: Database migration files

The application follows a monorepo structure with clear separation between frontend, backend, and shared code, enabling efficient development and deployment workflows.

## Recent Changes

### January 27, 2025
- Fixed React component errors (missing DropdownMenuSeparator import in Header component)
- Fixed nested anchor tag warnings in Sidebar navigation by replacing `<a>` tags with `<span>` elements
- Added comprehensive meta tags for SEO optimization:
  - Meta title: "Tokenized Share | Kalp Studio"
  - Meta description: "TokniFy is Share Tokenization Platform developed by Kalp Studio"
  - Open Graph and Twitter Card tags for social media sharing