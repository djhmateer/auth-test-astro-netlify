# Astro Netlify Authentication Demo

An Astro project demonstrating password-protected routes using JWT authentication with Netlify Serverless Functions and middleware.

## 🔒 Authentication Flow

This project implements a complete authentication system that protects the `/projects/*` routes using a multi-layer approach:

### Architecture Overview

```
User Request → Astro Middleware → Protected Route
     ↓              ↓
Login Page → Netlify Serverless Function → JWT Token
```

### Detailed Flow

1. **Route Protection**: Astro middleware (`src/middleware.ts`) intercepts all requests to `/projects/*`
2. **Token Validation**: Middleware checks for valid JWT token in httpOnly cookies
3. **Redirect to Login**: Unauthenticated users are redirected to `/login`
4. **Password Authentication**: Login form posts to Netlify serverless function (`/.netlify/functions/authenticate`)
5. **JWT Generation**: Function validates password and returns signed JWT token
6. **Cookie Storage**: Token stored in secure httpOnly cookie with 24-hour expiration
7. **Access Granted**: Valid token allows access to protected routes

### Why Serverless Functions Instead of Edge Functions?

This implementation uses **Netlify Serverless Functions** rather than Edge Functions for several technical reasons:

#### Advantages of Serverless Functions for Authentication:

- **JWT Library Support**: Full Node.js runtime supports `jsonwebtoken` library without compatibility issues
- **Cryptographic Operations**: Complete access to Node.js crypto APIs for secure token generation
- **Code Sharing**: Can import shared utilities from `src/utils/auth.ts` without bundling complications
- **Comprehensive Logging**: Full `console.log` support for debugging authentication flows
- **Environment Variables**: Seamless access to `process.env` for secrets management
- **Cold Start Acceptable**: Authentication requests are infrequent, making cold start latency acceptable

#### Edge Functions Limitations:

- **Runtime Restrictions**: Limited JavaScript runtime may not support all JWT operations
- **Library Compatibility**: Some Node.js libraries don't work in edge environments
- **Debugging Constraints**: Limited logging capabilities for troubleshooting auth issues

### Security Features

- **JWT Tokens**: Cryptographically signed with configurable secret
- **HttpOnly Cookies**: Prevents XSS attacks by blocking JavaScript access
- **Secure Cookies**: HTTPS-only transmission (production)
- **SameSite Protection**: CSRF prevention
- **Token Expiration**: 24-hour automatic invalidation
- **Server-side Validation**: All authentication logic runs server-side

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:4321` and try accessing the protected project link.

### Default Credentials

- **Password**: `1` (hardcoded fallback, configurable via environment variables)

### Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start development server at localhost:4321 |
| `pnpm build` | Build production site to ./dist/ |
| `pnpm preview` | Preview build locally |

## ⚙️ Configuration

### Environment Variables

**For Production (Netlify):**
Set these variables in your Netlify site dashboard under Site settings → Environment variables:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PROTECTED_PASSWORD=your-secure-password
```

**For Local Development:**
The code uses hardcoded fallbacks (not recommended for production):
- Default password: `1`
- Default JWT secret: `your-secret-key-change-in-production`

**Note:** This project does **not** use a `.env` file - all configuration is either hardcoded fallbacks or Netlify environment variables.

## 📁 Key Files

### Authentication Components

- **`src/middleware.ts`** - Route protection middleware with comprehensive logging
- **`src/pages/login.astro`** - Login form and server-side processing with client-side event logging
- **`src/pages/logout.astro`** - Session termination
- **`src/utils/auth.ts`** - JWT utilities and password validation with detailed logging
- **`netlify/functions/authenticate.ts`** - Serverless authentication endpoint with IP tracking

### Protected Routes

- **`src/pages/projects/`** - All routes here require authentication
- Add new protected pages under this directory

## 🔍 Debugging & Logging

The application includes **comprehensive logging** throughout the authentication flow:

### Server Logs
- **Middleware**: Route protection attempts, token validation, IP tracking
- **Serverless Function**: Authentication requests, password validation, token generation
- **Auth Utils**: JWT operations, token expiration handling, detailed error categorization

### Client Logs
- **Login Page**: Form interactions, field focus events, page visibility changes
- **User Behavior**: Password field interactions, form submission tracking

### Log Format
All logs use consistent timestamping: `[YYYY-MM-DDTHH:mm:ss.sssZ] COMPONENT: Message`

**View Logs:**
- **Development**: Terminal running `pnpm dev`
- **Client-side**: Browser console (F12)
- **Production**: Netlify function logs in dashboard

## 🚢 Deployment

### Netlify Deployment

1. **Connect Repository**: Link your Git repo to Netlify
2. **Build Settings**:
   - Build command: `pnpm build`
   - Publish directory: `dist`
3. **Environment Variables**: Set `JWT_SECRET` and `PROTECTED_PASSWORD` in Netlify dashboard
4. **Deploy**: Netlify automatically handles the Astro + Serverless Functions setup

### Manual Deployment

```bash
# Build for production
pnpm build

# Deploy dist/ folder and netlify/ functions to your hosting provider
```

## 🛡️ Security Considerations

- **Change Default Password**: Set `PROTECTED_PASSWORD` environment variable (currently defaults to `1`)
- **Strong JWT Secret**: Use a cryptographically secure random string for `JWT_SECRET`
- **HTTPS Only**: Ensure secure cookies work properly in production
- **Rate Limiting**: Consider adding rate limiting to login attempts (not implemented)
- **Audit Logs**: Monitor authentication attempts in Netlify function logs

## 🔧 Customization

### Adding New Protected Routes

Create new files under `src/pages/projects/`:

```astro
---
// src/pages/projects/secret-dashboard.astro
import Layout from '../../layouts/Layout.astro';
---

<Layout>
  <h1>🔒 Secret Dashboard</h1>
  <p>This page is automatically protected!</p>
</Layout>
```

### Changing Protection Scope

Edit `src/middleware.ts` to protect different routes:

```typescript
// Protect /admin/* instead of /projects/*
if (url.pathname.startsWith('/admin/')) {
  // ... authentication logic
}
```

### Custom Authentication Logic

Modify `src/utils/auth.ts` for different authentication methods:
- Database user lookup
- Third-party OAuth
- Multi-factor authentication

### Converting to Edge Functions

To use Edge Functions instead of Serverless Functions:

1. Move `netlify/functions/authenticate.ts` to `netlify/edge-functions/authenticate.ts`
2. Replace `jsonwebtoken` library with Web Crypto API
3. Update imports and function signature for edge runtime
4. Test thoroughly due to runtime differences

## 📊 Technical Specifications

- **Astro Version**: 5.13.11
- **Netlify Adapter**: @astrojs/netlify 6.5.11
- **Authentication**: JWT with jsonwebtoken library
- **Function Type**: Serverless Functions (Node.js runtime)
- **Session Duration**: 24 hours
- **Logging**: Comprehensive client and server-side logging

## 📝 License

This project is open source and available under the [MIT License](LICENSE).