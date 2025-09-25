import { defineMiddleware } from 'astro/middleware';
import { verifyToken } from './utils/auth';

/**
 * AUTHENTICATION MIDDLEWARE
 *
 * This middleware runs on EVERY request to the Astro application.
 * It serves as the first line of defense for protecting routes.
 *
 * FLOW:
 * 1. Extract request information (URL, IP, user agent)
 * 2. Check if the requested route requires protection (/projects/*)
 * 3. If protected: verify JWT token from httpOnly cookie
 * 4. If valid: allow access to continue
 * 5. If invalid/missing: redirect to login page
 * 6. If public route: allow access without authentication
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, request } = context;
  const timestamp = new Date().toISOString();

  // Extract client information for logging and security tracking
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // STEP 1: Determine if this is a protected route
  // Any route starting with /projects/ requires authentication
  if (url.pathname.startsWith('/projects/')) {
    console.log(`[${timestamp}] MIDDLEWARE: Protected route access attempt: ${url.pathname} from ${clientIP}`);
    console.log(`[${timestamp}] MIDDLEWARE: User-Agent: ${userAgent}`);

    // STEP 2: Look for authentication token in httpOnly cookie
    // The token is stored as 'auth-token' cookie set during login
    const authToken = cookies.get('auth-token');

    if (!authToken) {
      // STEP 3A: No token found - user is not authenticated
      console.log(`[${timestamp}] MIDDLEWARE: No auth token found for ${url.pathname}, redirecting to login from ${clientIP}`);
      return redirect('/login');
    }

    console.log(`[${timestamp}] MIDDLEWARE: Auth token found, verifying for ${url.pathname} from ${clientIP}`);

    try {
      // STEP 3B: Token found - verify it's valid and not expired
      // This calls our JWT verification utility
      const isValid = await verifyToken(authToken.value);

      if (!isValid) {
        // STEP 4A: Token is invalid or expired
        console.log(`[${timestamp}] MIDDLEWARE: Invalid token for ${url.pathname}, clearing cookie and redirecting from ${clientIP}`);
        // Clean up the invalid cookie to force fresh login
        cookies.delete('auth-token', { path: '/' });
        return redirect('/login');
      }

      // STEP 4B: Token is valid - user is authenticated
      console.log(`[${timestamp}] MIDDLEWARE: Valid token verified for ${url.pathname} from ${clientIP}, allowing access`);

    } catch (error) {
      // STEP 4C: Error during token verification
      console.error(`[${timestamp}] MIDDLEWARE: Error verifying token for ${url.pathname} from ${clientIP}:`, error);
      // Treat errors as authentication failure for security
      cookies.delete('auth-token', { path: '/' });
      return redirect('/login');
    }
  } else {
    // STEP 5: Public route - no authentication required
    console.log(`[${timestamp}] MIDDLEWARE: Public route access: ${url.pathname} from ${clientIP}`);
  }

  // STEP 6: Continue to the actual route handler
  // Either user is authenticated for protected route, or it's a public route
  return next();
});