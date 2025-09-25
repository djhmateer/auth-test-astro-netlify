import { defineMiddleware } from 'astro/middleware';
import { verifyToken } from './utils/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect, request } = context;
  const timestamp = new Date().toISOString();
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Check if the request is for a protected route
  if (url.pathname.startsWith('/projects/')) {
    console.log(`[${timestamp}] MIDDLEWARE: Protected route access attempt: ${url.pathname} from ${clientIP}`);
    console.log(`[${timestamp}] MIDDLEWARE: User-Agent: ${userAgent}`);

    const authToken = cookies.get('auth-token');

    if (!authToken) {
      console.log(`[${timestamp}] MIDDLEWARE: No auth token found for ${url.pathname}, redirecting to login from ${clientIP}`);
      // No token, redirect to login
      return redirect('/login');
    }

    console.log(`[${timestamp}] MIDDLEWARE: Auth token found, verifying for ${url.pathname} from ${clientIP}`);

    try {
      const isValid = await verifyToken(authToken.value);
      if (!isValid) {
        console.log(`[${timestamp}] MIDDLEWARE: Invalid token for ${url.pathname}, clearing cookie and redirecting from ${clientIP}`);
        // Invalid token, redirect to login
        cookies.delete('auth-token', { path: '/' });
        return redirect('/login');
      }
      console.log(`[${timestamp}] MIDDLEWARE: Valid token verified for ${url.pathname} from ${clientIP}, allowing access`);
    } catch (error) {
      console.error(`[${timestamp}] MIDDLEWARE: Error verifying token for ${url.pathname} from ${clientIP}:`, error);
      // Error verifying token, redirect to login
      cookies.delete('auth-token', { path: '/' });
      return redirect('/login');
    }
  } else {
    // Log non-protected route access
    console.log(`[${timestamp}] MIDDLEWARE: Public route access: ${url.pathname} from ${clientIP}`);
  }

  // Continue to the next middleware or route handler
  return next();
});