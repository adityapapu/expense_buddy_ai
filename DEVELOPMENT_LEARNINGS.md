# Project Learnings: expense_buddy_ai - Next.js expense tracking application

**Date**: 2025-09-13

## Key Learnings:

### 1. Google OAuth Integration
- **Issue**: Google OAuth redirect URI mismatch error occurs when the configured redirect URIs in Google Cloud Console don't match what NextAuth is using
- **Solution**: Required redirect URI format: `http://localhost:3000/api/auth/callback/google` for development
- **Production**: Must also add production URL when deployed: `https://yourdomain.com/api/auth/callback/google`
- **Environment Variables**: AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, NEXTAUTH_URL, AUTH_SECRET

### 2. Vercel Analytics Integration
- **Simple integration** with Next.js using `@vercel/analytics` package
- **Implementation**: Add `<Analytics />` component to root layout
- **Configuration**: No additional configuration needed for Vercel deployments
- **Features**: Automatically tracks page views and web vitals

### 3. Profile Settings Implementation
- **Database Connection**: Connected profile settings with real database data using Prisma
- **User Model Fields**: id, name, email, image (email managed by OAuth)
- **Architecture**: Created server actions for clean separation of concerns
- **API Design**: API endpoints for profile CRUD operations
- **Data Validation**: Removed unnecessary fields not in database schema
- **Email Management**: Made email field read-only since it's OAuth managed
- **Avatar Generation**: Used dicebear.com for dynamic avatar generation

### 4. Mobile-Only Navigation Features
- **Device Restriction**: Scan & Pay option restricted to mobile devices only
- **Implementation**: Used responsive classes and mobile menu
- **UI Design**: Desktop navigation shows main items, mobile menu includes all items

### 5. Database Schema Understanding
- **User Model**: Minimal with only essential fields
- **OAuth Integration**: OAuth handles authentication, email is not directly editable
- **Best Practice**: Profile updates should only modify supported fields

### 6. Code Patterns Used
- **Server Actions**: For database operations
- **API Routes**: With proper error handling
- **Client Components**: With loading states and toast notifications
- **Form Validation**: Using Zod and react-hook-form
- **Responsive Design**: With Tailwind CSS

### 7. Technology Stack Insights
- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v5 with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **UI Libraries**: HeroUI (primary) + shadcn/ui components
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API for transaction categorization
- **Package Manager**: Bun for faster development

### 8. Development Workflow
- **Database Operations**: `bun run db:generate`, `bun run db:migrate`, `bun run db:push`
- **Development**: `bun run dev` with Turbopack
- **Build**: `bun run build` for production
- **Linting**: `bun run lint` for code quality

### 9. Key Challenges Solved
- **OAuth Redirect URI Configuration**: Proper setup for development and production
- **Mobile-Responsive Design**: Conditional feature availability based on device
- **Database Schema Alignment**: Ensuring UI matches actual database structure
- **State Management**: Server-side vs client-side data handling

### 10. Performance Optimizations
- **Turbopack**: Enabled for faster development builds
- **Image Optimization**: Next.js Image component for avatar generation
- **Bundle Size**: Optimized imports and conditional loading

## Next Steps / Future Considerations
- [ ] Integrate with ByteRover API for automated learning capture
- [ ] Add more comprehensive error handling for OAuth flows
- [ ] Implement offline capabilities for mobile users
- [ ] Add advanced analytics and reporting features
- [ ] Consider adding more payment method integrations

## Notes
These learnings cover OAuth setup, analytics integration, profile management, mobile-specific features, and proper Next.js patterns for a production application. The project demonstrates modern full-stack development practices with a focus on user experience and maintainability.