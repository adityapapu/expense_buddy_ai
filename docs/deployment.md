# Deployment Guide

This guide covers deploying Expense Buddy AI to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Database Setup](#database-setup)
- [Domain Configuration](#domain-configuration)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com) for hosting
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) for database
- [Google Cloud Console](https://console.cloud.google.com) for OAuth
- [OpenAI Account](https://platform.openai.com) for AI features

### Development Setup
```bash
# Ensure you have the latest versions
node --version  # v18+ required
bun --version   # Latest version recommended

# Install Vercel CLI
npm i -g vercel
```

## Environment Configuration

### Production Environment Variables

Create production environment variables in Vercel dashboard or via CLI:

```bash
# Database - Vercel Postgres
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-random-string"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"
```

### Generating Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   ```
   https://your-domain.com/api/auth/callback/google
   ```

## Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables

3. **Automatic Deployments**
   - Every push to `main` triggers deployment
   - Preview deployments for pull requests
   - Automatic rollbacks on failure

### Method 2: Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy from project root
vercel

# Set production environment variables
vercel env add NEXTAUTH_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add OPENAI_API_KEY production
# ... add all required variables

# Redeploy with new environment variables
vercel --prod
```

### Build Configuration

Vercel automatically detects Next.js projects. If you need custom configuration:

```javascript
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "installCommand": "bun install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## Database Setup

### Vercel Postgres (Recommended)

1. **Create Database**
   ```bash
   # Via Vercel CLI
   vercel storage create postgres

   # Or via dashboard: vercel.com/dashboard/stores
   ```

2. **Configure Connection**
   Vercel automatically adds these environment variables:
   ```bash
   POSTGRES_PRISMA_URL      # For Prisma (connection pooling)
   POSTGRES_URL_NON_POOLING # For direct connections
   ```

3. **Run Migrations**
   ```bash
   # Deploy database schema
   bunx prisma migrate deploy

   # Generate Prisma client
   bunx prisma generate
   ```

### Alternative: External PostgreSQL

For external databases (AWS RDS, Google Cloud SQL, etc.):

```bash
# Connection string format
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
```

### Database Seeding (Optional)

```bash
# Create seed script
# prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default categories, payment methods, etc.
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })

# Run seed
bunx prisma db seed
```

## Domain Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   ```bash
   # Via CLI
   vercel domains add your-domain.com

   # Via dashboard: Project Settings > Domains
   ```

2. **DNS Configuration**
   Add these DNS records to your domain provider:
   ```
   Type: CNAME
   Name: www (or @)
   Value: cname.vercel-dns.com
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - HTTPS is enforced by default

### Environment Variable Updates

Update OAuth and NextAuth URLs for custom domain:

```bash
# Update environment variables
NEXTAUTH_URL="https://your-domain.com"

# Update Google OAuth redirect URIs
# Add: https://your-domain.com/api/auth/callback/google
```

## Monitoring & Observability

### Vercel Analytics

```bash
# Install Vercel Analytics
bun add @vercel/analytics

# Add to layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Monitoring

```bash
# Add Sentry (optional)
bun add @sentry/nextjs

# Configure sentry.client.config.js & sentry.server.config.js
```

### Performance Monitoring

```bash
# Vercel Speed Insights
bun add @vercel/speed-insights

import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Database Monitoring

Monitor Prisma queries and database performance:

```typescript
// Add to prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Production logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
})
```

## Security Checklist

### Pre-deployment Security

- [ ] All environment variables secured
- [ ] No secrets in code repository
- [ ] HTTPS enforced in production
- [ ] OAuth redirect URIs configured
- [ ] Database connection strings secured
- [ ] Error messages don't leak sensitive information

### Production Security Headers

Next.js automatically adds security headers. Customize if needed:

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}
```

## Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Check build logs
vercel logs

# Common fixes:
# 1. TypeScript errors
bunx tsc --noEmit

# 2. Missing dependencies
bun install

# 3. Environment variables
vercel env ls
```

#### Database Connection Issues
```bash
# Test database connection
bunx prisma db pull

# Check migration status
bunx prisma migrate status

# Reset database (development only)
bunx prisma migrate reset
```

#### Authentication Problems
```bash
# Verify OAuth configuration
curl https://your-domain.com/api/auth/providers

# Check redirect URIs match exactly
# Common issue: http vs https mismatch
```

#### AI Service Errors
```bash
# Check OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# Monitor API usage
# Check billing in OpenAI dashboard
```

### Performance Issues

#### Slow Database Queries
```sql
-- Check database performance
EXPLAIN ANALYZE SELECT * FROM "Transaction" 
WHERE "creatorId" = 'user-id' 
ORDER BY "date" DESC LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_transaction_creator_date 
ON "Transaction"("creatorId", "date");
```

#### High Memory Usage
```bash
# Check bundle size
bunx @next/bundle-analyzer

# Optimize imports
# Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'))
```

### Rollback Strategy

```bash
# Rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback <deployment-url>

# Database rollback (if needed)
bunx prisma migrate reset
bunx prisma migrate deploy
```

## Production Maintenance

### Regular Tasks

1. **Monitor Application Health**
   - Check error rates in Vercel dashboard
   - Monitor database performance
   - Review OpenAI API usage and costs

2. **Database Maintenance**
   ```bash
   # Check database size
   SELECT pg_size_pretty(pg_database_size('database_name'));
   
   # Analyze query performance
   SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
   ```

3. **Security Updates**
   ```bash
   # Update dependencies regularly
   bun update
   
   # Check for vulnerabilities
   bun audit
   ```

### Backup Strategy

1. **Database Backups**
   - Vercel Postgres includes automatic backups
   - Consider additional backup for critical data
   ```bash
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **Environment Configuration Backup**
   ```bash
   # Export environment variables
   vercel env pull .env.production
   ```

## Scaling Considerations

### Horizontal Scaling
- Vercel automatically handles scaling
- Serverless functions scale based on demand
- Database connection pooling prevents connection exhaustion

### Performance Optimization
- Use Next.js Image optimization
- Implement proper caching strategies
- Consider CDN for static assets

### Cost Monitoring
- Monitor Vercel usage in dashboard
- Track OpenAI API costs
- Set up billing alerts

This deployment guide ensures a secure, scalable production environment for Expense Buddy AI.