# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OUTPUT QUEST 叡智の継承者 is an RPG-style learning support web application that gamifies the process of writing technical articles on Zenn. Users grow their "hero" character by publishing articles, gaining levels, titles, items, and party members through a gamification system.

**Tech Stack:**
- **Framework**: Next.js 16.0.0 (App Router) + React 19.2.0
- **Language**: TypeScript 5.9.3 (strict mode)
- **Styling**: Tailwind CSS v4.1.16 + CSS Modules
- **UI Components**: shadcn/ui + Radix UI
- **Animation**: Motion (Framer Motion) v12.23.24
- **Audio**: Howler.js v2.2.4
- **Auth**: Clerk v6.34.1
- **Database**: Supabase (PostgreSQL) + Prisma ORM v6.18.0
- **AI**: Vercel AI SDK v5.0.78 + Gemini 2.5 Pro
- **Package Manager**: pnpm v10.11.1 (strictly enforced)
- **Deployment**: Vercel

## Important Conventions

### Package Manager
**ALWAYS use `pnpm`**. Never use `npm` or `yarn` commands.

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017

### Next.js 16 Features
- **React Compiler** enabled (`reactCompiler: true`)
- **Cache Components** enabled (`cacheComponents: true`)
- Server Components are the default
- Use Server Actions for mutations with `use server`
- Leverage ISR with `export const revalidate = <seconds>`

### Styling Approach
- **Primary**: Tailwind CSS v4.1.16 with utility classes
  - v4 uses CSS-first approach with `@import "tailwindcss"` and `@theme` blocks
- **Secondary**: CSS Modules for complex animations and component-specific styles
  - File naming: `ComponentName.module.css`
  - Placed alongside component files

### Component Organization
**Three-tier structure:**

1. **Local/Page Components** (`src/app/**/<page>/`)
   - Page-specific UI components
   - Create `components/` subfolder when file count grows

2. **Shared Components** (`src/components/`)
   - Reusable UI across multiple pages
   - Categories: `auth/`, `common/`, `elements/`, `layout/`, `ui/` (shadcn)

3. **Feature Components** (`src/features/<domain>/components/`)
   - Domain-specific components with business logic
   - Export via barrel `index.ts` using named exports
   - Import using namespace pattern:
     ```ts
     import * as Party from "@/features/party/components";
     <Party.MemberCard />
     ```

### File Naming
- Components: PascalCase (`UserIconButton.tsx`)
- Modules/Utils: camelCase (`formatDate.ts`)
- CSS Modules: PascalCase (`ComponentName.module.css`)
- API Routes: kebab-case (`analyze-articles/route.ts`)

## Common Development Commands

### Development
```bash
pnpm dev              # Start development server (Turbopack)
pnpm build            # Production build
pnpm start            # Start production server
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix with ESLint + Prettier
pnpm format:check     # Check Prettier formatting
pnpm format:write     # Apply Prettier formatting
```

### Database (Prisma + Supabase)
```bash
pnpm prisma generate         # Generate Prisma Client
pnpm prisma migrate dev      # Run migrations (development)
pnpm prisma migrate deploy   # Deploy migrations (production)
pnpm prisma studio           # Open Prisma Studio (DB GUI)
```

### Testing Single Features
When working on specific features:
```bash
# For API testing, run dev server and use tools like curl or Postman
pnpm dev
# Then test specific API routes: /api/zenn, /api/ai/analyze-articles, etc.
```

## Architecture

### Directory Structure
```
src/
├── app/                    # Next.js App Router (routing + pages)
│   ├── (main)/            # Main layout route group
│   ├── api/               # API Routes
│   │   ├── ai/            # AI/LLM endpoints (Gemini)
│   │   ├── user/          # User management endpoints
│   │   ├── webhooks/      # Clerk webhooks
│   │   └── zenn/          # Zenn API integration
│   └── layout.tsx         # Root layout with providers
├── components/            # Shared reusable components
│   ├── auth/              # Authentication components
│   ├── common/            # Common UI elements
│   ├── elements/          # Basic UI primitives
│   ├── layout/            # Layout components
│   └── ui/                # shadcn/ui components
├── features/              # Feature-specific modules
│   └── <feature>/
│       ├── components/    # Feature components
│       ├── api/           # Feature API calls
│       ├── hooks/         # Feature hooks
│       ├── types/         # Feature types
│       └── utils/         # Feature utilities
├── config/                # Environment configuration (varies by environment)
├── consts/                # Immutable constants (shared across environments)
├── contexts/              # React Context providers
│   ├── AudioContext.tsx   # Audio state management
│   ├── HeroContext.tsx    # Hero data caching (10min TTL)
│   └── SignOutHandler.tsx # Sign-out handling
├── hooks/                 # Custom hooks
├── lib/                   # Libraries and utilities
│   ├── api/               # API client utilities
│   ├── cache-tags.ts      # Cache tag management
│   ├── prisma.ts          # Prisma Client singleton
│   └── utils.ts           # General utilities
├── shared/                # Shared data and constants
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### Data Flow
1. **Authentication**: Clerk → Server Components/API Routes
2. **Zenn Integration**: Zenn RSS API → Server Components → Client UI
3. **Database**: Prisma ORM → Supabase PostgreSQL
4. **AI Features**: Client → API Route (`/api/ai/analyze-articles`) → Gemini via Vercel AI SDK

### State Management
- **Global**: React Context (Audio, Hero data with 10min cache)
- **Local**: useState, useLocalStorage
- **Server**: Server Components fetch data directly

### Key Features
- **Dashboard**: Hero level, post count, rewards display
- **Posts (学びの書)**: Zenn article list
- **Explore (記事探索)**: AI-powered article theme suggestions (Gemini 2.5 Pro)
- **Strength (つよさ)**: Level, titles, equipment, adventure logs
- **Party (なかま)**: Character collection management
- **Items (アイテム)**: Item collection management
- **Connection (連携)**: Clerk auth + Zenn account linking

## Critical Rules from Cursor Configuration

### Always Apply These Rules
1. **Use pnpm exclusively** - npm/yarn are forbidden
2. **Confirm before breaking changes** - For large refactors or destructive updates, always confirm with user
3. **Follow frontend.mdc for UI/UX changes** - Color, layout, fonts must match design system
4. **Never change tech stack versions without approval** - Framework/library versions are locked
5. **Use existing patterns** - Study similar features before implementing new ones

### Image Handling
- Use Next.js `<Image />` component with explicit `width`/`height`
- Apply `loading="lazy"` by default (use `priority` only for above-the-fold content)
- Remote image domains configured: zenn.dev, placehold.jp, res.cloudinary.com, storage.googleapis.com, img.clerk.com

### Data Fetching Best Practices
- **Server Components**: Direct `fetch` calls with `cache`/`revalidate` options
- **Route Handlers**: Centralize business logic in `/api` routes
- **Server Actions**: Use `use server` for form submissions and mutations
- **Client Components**: useEffect + fetch or SWR/React Query if needed

### Error Handling
- API errors: Return 4xx/5xx with clear error messages
- UI errors: Display via Sonner toast (variant="destructive" for errors)
- Log appropriately: console.debug, console.log, console.error
- **Never log sensitive data** (PII, secrets, tokens)

### Form Validation
- Use zod for schema validation (shared between client/server)
- Large forms: Consider React Hook Form + zod integration
- Show validation errors inline or via Sonner toast

## Git Commit Message Format (Conventional Commits)

```
<type>(<scope>): <subject>
```

**Common types:**
- `feat`: New feature
- `fix`: Bug fix
- `hotfix`: Critical bug fix
- `add`: Add new file or feature
- `update`: Improve existing feature
- `refactor`: Code refactoring without behavior change
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `chore`: Maintenance tasks

**Examples:**
```
feat(explore): AI記事テーマ提案機能を追加
fix(ui): モーダル閉じないバグを修正
refactor(api): Zenn API呼び出しをServer Actionに移行
```

## Testing and Debugging

### Local Development
1. Ensure `.env` is configured (copy from `.env.example`)
2. Run `pnpm prisma generate` to generate Prisma Client
3. Run `pnpm dev` to start development server at http://localhost:3000
4. Check console for errors - TypeScript strict mode catches most issues

### Database Debugging
- Use `pnpm prisma studio` to inspect/modify database records
- Check Supabase dashboard for query logs and connection pooling status

### API Debugging
- AI endpoints use Gemini 2.5 Pro (free tier: 5 RPM, 250K TPM, 100 RPD)
- Check API route logs in development console
- Verify environment variables for Clerk, Supabase, Gemini are set

## Performance Considerations

### Next.js Optimizations
- Leverage ISR with `revalidate` for semi-static pages
- Use Server Components by default (no client-side JS overhead)
- Dynamic imports for heavy client components
- Optimize images with next/image (automatic WebP, responsive sizes)

### Caching Strategy
- HeroContext: 10-minute TTL for hero data
- Prisma singleton pattern to avoid connection exhaustion
- Cache tags for fine-grained invalidation (`revalidateTag`)

## Security

### Environment Variables
- **NEVER commit** `.env` files
- Use `.env.example` as template
- Sensitive keys: Clerk secrets, Supabase service role key, Gemini API key
- Public keys: Prefix with `NEXT_PUBLIC_` for client-side access

### Authentication
- Clerk handles auth flow
- Middleware protects routes (if implemented)
- Webhooks validate Clerk signature with `CLERK_WEBHOOK_SIGNING_SECRET`

### Database Access
- Prisma queries are parameterized (SQL injection safe)
- Use Supabase service role key **only on server** (never expose to client)

## Common Pitfalls

1. **Don't use npm/yarn** - Always use pnpm
2. **Don't read entire files unnecessarily** - Use Serena's symbol overview tools for efficient code exploration
3. **Don't skip confirmation for breaking changes** - User must approve major refactors
4. **Don't mutate tech stack versions** - Versions are pinned, changes require approval
5. **Don't forget TypeScript strict mode** - All code must pass strict type checking
6. **Don't use client components by default** - Server Components first, add 'use client' only when needed

## Helpful Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/blog/tailwindcss-v4)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Next.js Integration](https://clerk.com/docs/quickstarts/nextjs)
- [Vercel AI SDK](https://ai-sdk.dev)
