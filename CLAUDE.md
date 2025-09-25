# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands use pnpm as the package manager:

- `pnpm dev` - Start local dev server at localhost:4321
- `pnpm build` - Build production site to ./dist/
- `pnpm preview` - Preview build locally before deploying

## Architecture

This is an Astro project with Netlify adapter configured for password-protected routes using JWT authentication.

### Authentication Flow

The `/projects/*` routes are protected by a multi-layer authentication system:

1. **Astro Middleware** (`src/middleware.ts`) - Native Astro middleware that runs within the SSR application context, not as a separate function. Intercepts requests to `/projects/*` and validates JWT tokens stored in httpOnly cookies
2. **Login Page** (`src/pages/login.astro`) - Server-rendered form that posts credentials to Netlify function
3. **Netlify Serverless Function** (`netlify/functions/authenticate.ts`) - Validates password and returns JWT token
4. **Auth Utilities** (`src/utils/auth.ts`) - JWT token generation, verification, and password validation

### Function Type: Serverless Functions (Not Edge Functions)

This implementation uses Netlify **Serverless Functions** rather than Edge Functions for the following reasons:

- **JWT Library Compatibility**: The `jsonwebtoken` library works reliably in the Node.js runtime of serverless functions
- **No Environment Restrictions**: Serverless functions have full Node.js API access for cryptographic operations
- **Shared Code**: Can import shared utilities from `src/utils/auth.ts` without bundling issues
- **Logging Capability**: Full console.log support for debugging authentication flows
- **Cold Start Acceptable**: Authentication requests are infrequent, so cold start latency is acceptable

Edge Functions would be faster but have runtime limitations that make JWT handling more complex.

### Key Configuration

- **SSR Mode**: `output: 'server'` with `@astrojs/netlify` adapter
- **Protected Routes**: Any path starting with `/projects/` requires authentication
- **Session Management**: JWT tokens with 24-hour expiration stored in secure httpOnly cookies
- **Environment Variables**: `JWT_SECRET` and `PROTECTED_PASSWORD` (defaults in code, no .env file used)
- **Middleware Execution**: Astro's native middleware runs within the main SSR application, processed by Netlify adapter

### Default Credentials

- **Password**: `1` (hardcoded fallback in `src/utils/auth.ts`)
- **JWT Secret**: `'your-secret-key-change-in-production'` (hardcoded fallback)

### Authentication State

- Unauthenticated users accessing `/projects/*` → redirect to `/login`
- Invalid/expired tokens → clear cookie and redirect to `/login`
- Successful login → set auth cookie and redirect to requested page
- Logout via `/logout` → clear auth cookie and redirect to home

### Comprehensive Logging

All authentication components include detailed logging:
- Server-side: Middleware, Netlify function, auth utilities
- Client-side: Login page interactions and form events
- Format: `[timestamp] COMPONENT: Message with IP tracking`

### Deployment Notes

- Netlify builds require environment variables set in dashboard (not using local .env)
- `.netlify/` directory contains build artifacts and should remain in .gitignore
- Netlify functions are auto-deployed from `netlify/functions/` directory
- No Edge Functions directory present - uses traditional serverless functions only
- Middleware runs as part of the main Astro SSR bundle, not as separate functions

### Architecture Components

- **Astro Middleware**: Built into main app, runs before page rendering within SSR context
- **Netlify Functions**: Separate serverless functions in `netlify/functions/` directory
- **Edge Functions**: Not used (would be in `netlify/edge-functions/` if implemented)