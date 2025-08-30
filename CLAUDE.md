# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Database Operations
- `bun run db:generate` - Generate Prisma client and apply migrations in development
- `bun run db:migrate` - Deploy migrations to production database 
- `bun run db:push` - Push Prisma schema state to database (development)
- `bun run db:studio` - Open Prisma Studio GUI for database inspection

### Build and Development
- `bun run dev` - Start Next.js development server with Turbopack
- `bun run build` - Build Next.js application for production
- `bun run start` - Start Next.js application in production mode
- `bun run lint` - Run ESLint for code quality checks

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **UI Libraries**: HeroUI (primary) + shadcn/ui components
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API for transaction categorization
- **Payment Processing**: UPI integration with QR scanning

### Project Structure

#### Server-Side Services (`src/server/services/`)
The application follows a service-oriented architecture with dedicated services:

- **`transactionService.ts`**: Core transaction CRUD operations, includes `createScanTransaction()` for QR payments with automatic payment method/category fallbacks
- **`aiService.ts`**: OpenAI integration for intelligent expense categorization and description enhancement
- **`userService.ts`**: User management and authentication helpers
- **`categoryService.ts`**: Category management with transaction type filtering
- **`paymentMethodService.ts`**: Payment method CRUD operations
- **`tagService.ts`**: Tag management for transaction labeling
- **`friendService.ts`**: Friend system for expense splitting

#### Database Schema Key Concepts
- **Users**: Central entity with OAuth authentication via NextAuth
- **Transactions**: Container model with `totalAmount` and `creatorId`
- **TransactionParticipants**: Individual entries per user with own `amount`, `category`, `paymentMethod`
- **Split Types**: EQUAL, AMOUNT, PERCENTAGE, SHARES for expense splitting
- **Categories**: Type-specific (INCOME/EXPENSE) and user-scoped
- **Friends System**: Separate `FriendRequest` and `Friend` models with bidirectional relationships

#### Page Structure
- **Dashboard** (`/dashboard`): Uses shadcn/ui components, includes quick actions
- **Transactions** (`/transactions`): Uses HeroUI components, full CRUD operations
- **Scan & Pay** (`/scan`): QR code scanning with AI-powered categorization
- **Reports** (`/reports`): Analytics and data visualization
- **Settings** (`/settings`): Account management and preferences
- **Friends** (`/friends`): Friend management and splitting capabilities

### UI Component Guidelines
The codebase uses **two different UI libraries**:
- **HeroUI**: Primary UI library for main application (transactions, scan, etc.)
- **shadcn/ui**: Used specifically in dashboard quick-actions and some utility components

When adding new features:
- Use HeroUI components for consistency with main app
- Only use shadcn/ui when extending existing dashboard functionality
- Import from `@heroui/react` for primary components
- Import from `@/components/ui/` for shadcn components

### Authentication & Authorization
- Uses NextAuth.js v5 with JWT strategy
- Google OAuth as primary provider
- Session handling via `auth()` function
- User context available through `getCurrentUser()` service
- All database operations are user-scoped

### AI Integration
- OpenAI GPT-3.5-turbo for transaction categorization
- Environment variable: `OPENAI_API_KEY`
- `generateTransactionSuggestion()` provides description and category suggestions
- `enhanceTransactionDescription()` improves transaction descriptions
- Graceful fallbacks when AI service unavailable

### QR Code & UPI Integration
- `@yudiel/react-qr-scanner` library (use `Scanner` component, not `QrScanner`)
- UPI URL format: `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR`
- Automatic UPI payment method creation via `ensureUPIPaymentMethod()`
- Cross-platform UPI app detection and launching
- Camera permission handling with user-friendly error messages

### Transaction Data Flow
1. **Standard Transactions**: `createTransaction()` with full validation
2. **QR Scan Payments**: `createScanTransaction()` with automatic fallbacks for missing categories/payment methods
3. **Split Expenses**: Multiple participants with individual amounts and split calculations
4. **AI Enhancement**: Automatic description and category suggestion based on merchant data

### Development Notes
- Uses Turbopack for faster development builds
- Bun as package manager and task runner
- TypeScript throughout with strict typing
- Prisma generates type-safe database client
- Environment variables managed through `.env` (see `.env.example`)
- Uses `"use server"` for server actions and `"use client"` for client components

### Common Patterns
- Server actions return `{ success: boolean, message: string, data?: T }` format
- User authentication check: `const user = await getCurrentUser()`
- Error handling via `getErrorMessage()` utility
- Database operations wrapped in Prisma transactions for consistency
- Soft deletes with `isDeleted` flags for audit trails