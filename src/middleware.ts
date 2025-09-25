import { defineMiddleware } from 'astro/middleware';
import { verifyToken } from './utils/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Check if the request is for a protected route
  if (url.pathname.startsWith('/projects/')) {
    const authToken = cookies.get('auth-token');

    if (!authToken) {
      // No token, redirect to login
      return redirect('/login');
    }

    try {
      const isValid = await verifyToken(authToken.value);
      if (!isValid) {
        // Invalid token, redirect to login
        cookies.delete('auth-token', { path: '/' });
        return redirect('/login');
      }
    } catch (error) {
      // Error verifying token, redirect to login
      cookies.delete('auth-token', { path: '/' });
      return redirect('/login');
    }
  }

  // Continue to the next middleware or route handler
  return next();
});