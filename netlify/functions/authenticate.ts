import type { Handler, HandlerResponse } from '@netlify/functions';
import { authenticatePassword, createAuthToken } from '../../src/utils/auth';

/**
 * NETLIFY SERVERLESS AUTHENTICATION FUNCTION
 *
 * This serverless function handles password authentication and JWT token generation.
 * It's called by the login page when users submit their credentials.
 *
 * AUTHENTICATION FLOW:
 * 1. Receive POST request with password from login form
 * 2. Validate HTTP method (only POST allowed)
 * 3. Parse and validate password from request body
 * 4. Check password against configured value
 * 5. If valid: generate and return JWT token
 * 6. If invalid: return 401 Unauthorized
 *
 * SECURITY FEATURES:
 * - Client IP logging for security monitoring
 * - HTTP method restriction (POST only)
 * - Input validation
 * - Detailed error handling
 * - Comprehensive logging of all authentication attempts
 *
 * Why Serverless Function (not Edge Function):
 * - Full Node.js runtime for JWT library compatibility
 * - Complete access to crypto APIs
 * - Shared code imports work reliably
 * - Comprehensive logging support
 */
export const handler: Handler = async (event): Promise<HandlerResponse> => {
  const timestamp = new Date().toISOString();

  // Extract client information for security tracking and logging
  const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

  console.log(`[${timestamp}] AUTH: Authentication request from ${clientIP}`);

  // STEP 1: Security check - only allow POST requests
  // This prevents accidental GET requests from exposing authentication
  if (event.httpMethod !== 'POST') {
    console.log(`[${timestamp}] AUTH: Method not allowed - ${event.httpMethod} from ${clientIP}`);
    return {
      statusCode: 405,
      headers: {
        'Allow': 'POST',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // STEP 2: Parse the request body to extract password
    // The login form sends JSON with password field
    const { password } = JSON.parse(event.body || '{}');
    console.log(`[${timestamp}] AUTH: Parsing request body from ${clientIP}`);

    // STEP 3: Validate that password was provided
    if (!password) {
      console.log(`[${timestamp}] AUTH: Missing password in request from ${clientIP}`);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Password is required' })
      };
    }

    console.log(`[${timestamp}] AUTH: Validating password from ${clientIP}`);

    // STEP 4: Authenticate the provided password
    // This calls our utility function that compares against configured password
    const isValidPassword = authenticatePassword(password);

    if (!isValidPassword) {
      // STEP 5A: Authentication failed - invalid password
      console.log(`[${timestamp}] AUTH: Invalid password attempt from ${clientIP}`);
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }

    // STEP 5B: Authentication successful - generate JWT token
    console.log(`[${timestamp}] AUTH: Successful authentication from ${clientIP}, generating token`);

    // Create a signed JWT token with 24-hour expiration
    // This token will be stored in an httpOnly cookie by the login page
    const token = createAuthToken();

    console.log(`[${timestamp}] AUTH: Token generated and returned to ${clientIP}`);

    // STEP 6: Return success response with JWT token
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token,
        message: 'Authentication successful'
      })
    };

  } catch (error) {
    // STEP 7: Handle any errors during processing
    // This includes JSON parsing errors, token generation errors, etc.
    console.error(`[${timestamp}] AUTH: Error processing request from ${clientIP}:`, error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};