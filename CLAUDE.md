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

1. **Astro Middleware** (`src/middleware.ts`) - Intercepts requests to `/projects/*` and validates JWT tokens stored in httpOnly cookies
2. **Login Page** (`src/pages/login.astro`) - Server-rendered form that posts credentials to Netlify function
3. **Netlify Function** (`netlify/functions/authenticate.ts`) - Validates password and returns JWT token
4. **Auth Utilities** (`src/utils/auth.ts`) - JWT token generation, verification, and password validation

### Key Configuration

- **SSR Mode**: `output: 'server'` with `@astrojs/netlify` adapter
- **Protected Routes**: Any path starting with `/projects/` requires authentication
- **Session Management**: JWT tokens with 24-hour expiration stored in secure httpOnly cookies
- **Environment Variables**: `JWT_SECRET` and `PROTECTED_PASSWORD` (defaults: see .env file)

### Authentication State

- Unauthenticated users accessing `/projects/*` → redirect to `/login`
- Invalid/expired tokens → clear cookie and redirect to `/login`
- Successful login → set auth cookie and redirect to requested page
- Logout via `/logout` → clear auth cookie and redirect to home

### Deployment Notes

- Netlify builds require environment variables set in dashboard
- `.netlify/` directory contains build artifacts and should remain in .gitignore
- Netlify functions are auto-deployed from `netlify/functions/` directory