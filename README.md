# 🏈 Flagscore

**The official platform for French Flag Football results and rankings**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://vercel.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security](#security)
- [SEO & Performance](#seo--performance)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Flagscore is the official platform for French Flag Football results, providing real-time scores,
rankings, and statistics for the French Championship and French Cup. Built in partnership with the
FFFA (French Flag Football Federation), it offers a comprehensive view of the sport's competitive
landscape in France.

### Key Highlights

- **Real-time Results**: Live scores and match updates
- **Comprehensive Rankings**: Detailed team statistics and standings
- **Mobile-First Design**: Optimized for all devices
- **High Performance**: Built with Next.js 16 and modern web technologies
- **SEO Optimized**: Full search engine optimization
- **Security First**: Advanced security measures and rate limiting

## ✨ Features

### 🏆 Competition Management

- **Season Selection**: Browse results by season (2024-2026)
- **Championship Types**: French Championship (Mixed), French Cup, Men's Championship
- **Pool Organization**: Results organized by competition pools
- **Day Navigation**: Easy navigation through competition days

### 📊 Results & Statistics

- **Live Scores**: Real-time match results
- **Team Performance**: Win/loss records and point differentials
- **Ranking Tables**: Complete standings with detailed statistics
- **Match History**: Historical results and trends

### 🔍 Team Search & Discovery

- **Team Search**: Real-time team search with suggestions
- **Team Details**: Comprehensive team statistics pages (`/equipe/[teamId]`)
- **Team Synchronization**: Automatic team data sync from rankings
- **URL Search Params**: Persistent search state with `nuqs`

### 📧 Contact & Communication

- **Contact Form**: Email integration with Resend
- **Toast Notifications**: User feedback system (Sonner)
- **Legal Pages**: Privacy policy and legal mentions

### 🎨 User Experience

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Theme**: Modern dark interface
- **Fast Loading**: Optimized performance with caching
- **Accessibility**: WCAG compliant design
- **Error Handling**: Comprehensive error management

### 🔒 Security & Performance

- **Rate Limiting**: API protection against abuse
- **Content Security Policy**: Advanced security headers
- **Caching Strategy**: Multi-level caching for optimal performance
- **Monitoring**: Real-time performance and error tracking

## 🛠 Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend & APIs

- **Next.js API Routes** - Serverless API endpoints
- **FFFA API Integration** - Official data source
- **Supabase** - PostgreSQL database and API (PostgREST)
- **React Query** - Data fetching, caching, and synchronization
- **Rate Limiting** - Custom rate limiting system
- **Caching** - Multi-level caching strategy
- **Resend** - Email service (contact form)

### State Management & Utilities

- **Zustand** - Lightweight state management
- **nuqs** - URL search parameter state management
- **Sonner** - Toast notifications

### Development & Testing

- **Vitest** - Fast unit testing framework
- **Testing Library** - React component testing
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Turbo** - Monorepo build system
- **Husky** - Git hooks for code quality

### Deployment & Monitoring

- **Vercel** - Hosting and deployment
- **Vercel Analytics** - Performance monitoring
- **Custom Monitoring** - Application metrics
- **Error Tracking** - Comprehensive error handling

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended) or npm
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Loriick/flagscore.git
   cd flagscore
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables in `apps/web/.env.local`:

   ```env
   # FFFA API Configuration
   FFFA_BASE=https://www.fffa.org/wp-admin/admin-ajax.php
   FFFA_ACTION=fffa_calendar_api_proxy
   GOOGLE_VERIFICATION_CODE=your_code

   # Supabase Configuration (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON=your_supabase_anon_key

   # Application Configuration
   NEXT_PUBLIC_FLAGSCORE_ORIGIN=http://localhost:3000

   # Resend (Optional - for contact form)
   RESEND_API_KEY=re_xxxxx
   ```

   See [SUPABASE-SETUP.md](apps/web/SUPABASE-SETUP.md) for detailed Supabase configuration.

4. **Start Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
# Development
pnpm dev          # Start development server (all apps)
pnpm dev:clean    # Clear cache and start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Testing
pnpm test         # Run tests in watch mode
pnpm test:run     # Run tests once
pnpm test:ui      # Run tests with UI
pnpm test:coverage # Run tests with coverage

# Code Quality
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm type-check   # TypeScript type checking
pnpm format       # Format code with Prettier
pnpm format:check # Check code formatting

# Analysis
pnpm analyze      # Analyze bundle size
pnpm audit        # Security audit
```

## 📁 Project Structure

This is a **monorepo** using pnpm workspaces and Turbo:

```
flagscore/
├── apps/
│   └── web/                   # 🌐 Main Next.js application
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   │   ├── api/       # API routes
│       │   │   │   ├── teams/ # Team search & management
│       │   │   │   ├── contact/ # Contact form
│       │   │   │   ├── sync/  # FFFA data synchronization
│       │   │   │   ├── rankings/ # Rankings API
│       │   │   │   ├── matches/ # Matches API
│       │   │   │   └── ...
│       │   │   ├── classements/ # Rankings page
│       │   │   ├── recherche/ # Team search page
│       │   │   ├── equipe/    # Team detail pages
│       │   │   ├── a-propos/  # About page
│       │   │   ├── layout.tsx # Root layout
│       │   │   ├── page.tsx   # Home page
│       │   │   ├── robots.ts  # Robots.txt
│       │   │   └── sitemap.ts # Sitemap.xml
│       │   ├── components/     # React components
│       │   │   ├── ui/        # shadcn/ui components
│       │   │   ├── atoms/     # Atomic components
│       │   │   ├── molecules/ # Molecular components
│       │   │   ├── organisms/ # Complex components
│       │   │   ├── Header.tsx # Navigation header
│       │   │   ├── Footer.tsx # Site footer
│       │   │   ├── PoolsSelector.tsx # Main selector
│       │   │   ├── SearchTeams.tsx # Team search modal
│       │   │   └── ...
│       │   ├── hooks/         # Custom React hooks
│       │   │   ├── useTeams.ts
│       │   │   ├── useChampionships.ts
│       │   │   ├── useSupabaseOptimized.ts
│       │   │   └── ...
│       │   ├── lib/           # Utility libraries
│       │   │   ├── fffa-api.ts # FFFA API integration
│       │   │   ├── supabase.ts # Supabase client
│       │   │   ├── seo.ts      # SEO utilities
│       │   │   ├── security.ts # Security configuration
│       │   │   └── rate-limit.ts # Rate limiting
│       │   ├── store/         # Zustand stores
│       │   └── middleware.ts  # Next.js middleware
│       ├── public/            # Static assets
│       ├── supabase-migrations/ # Database migrations
│       └── ...
├── packages/
│   └── shared/                # 📦 Shared types and utilities
│       └── src/
│           ├── types/         # Shared TypeScript types
│           ├── constants/     # Shared constants
│           └── utils/         # Shared utilities
├── scripts/                   # Build and deployment scripts
├── turbo.json                 # Turbo configuration
├── pnpm-workspace.yaml        # pnpm workspace config
└── package.json               # Root dependencies
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for monorepo deployment details.

## 🔌 API Documentation

### Endpoints

#### Rankings API

```http
GET /api/rankings?poolId={id}
```

Returns rankings for a specific pool with caching.

#### Matches API

```http
GET /api/matches?poolId={id}
```

Returns matches and days for a specific pool.

#### Teams API

```http
GET /api/teams?search={term}&poolId={id}&championshipId={id}
```

Search and filter teams. Returns list of teams matching criteria.

```http
GET /api/teams/[teamId]
```

Get detailed information about a specific team.

```http
POST /api/teams
```

Synchronize teams from rankings data to Supabase.

#### Contact API

```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello..."
}
```

Send contact form email via Resend.

#### Sync API

```http
GET /api/sync?action={action}&championshipId={id}&poolId={id}
POST /api/sync
```

Synchronize FFFA data to Supabase. Actions: `championships`, `pools`, `days`, `matches`, `rankings`,
`complete`, `smart`.

#### Complete Data API

```http
GET /api/complete-data?season={year}&championshipId={id}&poolId={id}
```

Get all data for a competition (championships, pools, days, matches).

#### Pool Data API

```http
GET /api/pool-data?poolId={id}&dayId={id}
```

Get days and matches for a specific pool.

#### Metrics API (Development)

```http
GET /api/metrics
POST /api/metrics
```

Application metrics and monitoring data.

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Data API**: 50 requests per 5 minutes
- **Strict API**: 20 requests per minute
- **Auth API**: 5 requests per 15 minutes

### Response Headers

All API responses include rate limiting headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

## 🔒 Security

### Security Headers

- **Content Security Policy (CSP)**: Strict CSP configuration
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection
- **Strict-Transport-Security**: HTTPS enforcement
- **Referrer-Policy**: Referrer information control

### Rate Limiting

- **IP-based limiting**: Per-client request limits
- **User-Agent tracking**: Enhanced client identification
- **Automatic cleanup**: Expired entries removal
- **Configurable limits**: Different limits per endpoint type

### Input Validation

- **Type checking**: TypeScript for compile-time safety
- **Runtime validation**: Input sanitization and validation
- **SQL injection protection**: Parameterized queries
- **XSS prevention**: Content sanitization

## 🎯 SEO & Performance

### SEO Features

- **Structured Data**: JSON-LD schema markup
- **Dynamic Sitemap**: Auto-generated sitemap.xml
- **Robots.txt**: Search engine directives
- **Meta Tags**: Comprehensive meta tag optimization
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Enhanced Twitter sharing

### Performance Optimizations

- **Next.js Optimization**: Built-in performance features
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching Strategy**: Multi-level caching
- **CDN Integration**: Vercel Edge Network
- **Core Web Vitals**: Optimized for Google metrics

### Monitoring

- **Vercel Analytics**: Real-time performance metrics
- **Custom Metrics**: Application-specific monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking

## 🧪 Testing

### Test Configuration

- **Vitest**: Fast unit testing framework
- **Testing Library**: React component testing utilities
- **JSDOM**: Browser environment simulation
- **Coverage Reports**: Code coverage analysis

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Run tests once
pnpm test:run
```

### Test Structure

```
apps/web/src/
├── components/
│   └── __tests__/          # Component tests
├── hooks/
│   └── __tests__/          # Hook tests
├── lib/
│   └── __tests__/          # Utility tests
└── app/
    └── __tests__/          # Page tests
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure build settings

2. **Environment Variables**

   Configure in Vercel Dashboard or `.env.local`:

   ```env
   # FFFA API
   FFFA_BASE=https://www.fffa.org/wp-admin/admin-ajax.php
   FFFA_ACTION=fffa_calendar_api_proxy
   GOOGLE_VERIFICATION_CODE=your_code

   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON=your_supabase_anon_key

   # Application
   NEXT_PUBLIC_FLAGSCORE_ORIGIN=https://flagscore.vercel.app

   # Resend (Optional)
   RESEND_API_KEY=re_xxxxx
   ```

   See [SUPABASE-SETUP.md](apps/web/SUPABASE-SETUP.md) for Supabase configuration.

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Build Configuration

The application is optimized for production with:

- **Static Generation**: Pre-rendered pages
- **Edge Runtime**: Optimized API routes
- **Image Optimization**: Automatic image processing
- **Bundle Analysis**: Optimized bundle sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FFFA** - French Flag Football Federation for providing official data
- **Next.js Team** - For the amazing React framework
- **Vercel** - For hosting and deployment platform
- **shadcn/ui** - For beautiful UI components
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

For support and questions:

- **Email**: contact@flagscore.fr
- **Issues**: [GitHub Issues](https://github.com/Loriick/flagscore/issues)
- **Documentation**: See [DEPLOYMENT.md](DEPLOYMENT.md),
  [TEAMS_SEARCH_README.md](apps/web/TEAMS_SEARCH_README.md),
  [SUPABASE-SETUP.md](apps/web/SUPABASE-SETUP.md)

---

**Made with ❤️ for the French Flag Football community**
