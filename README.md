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
- **Rate Limiting** - Custom rate limiting system
- **Caching** - Multi-level caching strategy

### Development & Testing

- **Vitest** - Fast unit testing framework
- **Testing Library** - React component testing
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking

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
   git clone https://github.com/your-username/flagscore.git
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

   Configure your environment variables:

   ```env
   FFFA_BASE=https://api.example.com
   FFFA_ACTION=your_action
   GOOGLE_VERIFICATION_CODE=your_code
   ```

4. **Start Development Server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
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
```

## 📁 Project Structure

```
flagscore/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── classements/       # Rankings page
│   │   ├── a-propos/          # About page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── robots.ts          # Robots.txt
│   │   └── sitemap.ts         # Sitemap.xml
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── Header.tsx         # Navigation header
│   │   ├── Footer.tsx         # Site footer
│   │   ├── PoolsSelector.tsx  # Main selector component
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── useChampionships.ts
│   │   ├── useMatches.ts
│   │   ├── usePools.ts
│   │   └── useRankings.ts
│   ├── lib/                   # Utility libraries
│   │   ├── fffa-api.ts        # FFFA API integration
│   │   ├── seo.ts             # SEO utilities
│   │   ├── security.ts        # Security configuration
│   │   └── rate-limit.ts      # Rate limiting
│   └── middleware.ts          # Next.js middleware
├── public/                     # Static assets
├── vitest.config.ts           # Test configuration
├── next.config.ts             # Next.js configuration
└── package.json               # Dependencies
```

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
src/
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

   ```env
   FFFA_BASE=your_api_base_url
   FFFA_ACTION=your_action
   GOOGLE_VERIFICATION_CODE=your_code
   ```

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

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   pnpm test
   pnpm lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Standards

- **TypeScript**: All code must be type-safe
- **ESLint**: Follow the configured linting rules
- **Testing**: Add tests for new features
- **Documentation**: Update documentation as needed
- **Performance**: Consider performance implications

### Issue Reporting

When reporting issues, please include:

- **Environment**: Node.js version, OS
- **Steps to reproduce**: Clear reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

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
- **Issues**: [GitHub Issues](https://github.com/your-username/flagscore/issues)
- **Documentation**: [Project Wiki](https://github.com/your-username/flagscore/wiki)

---

**Made with ❤️ for the French Flag Football community**
# Test deployment trigger
