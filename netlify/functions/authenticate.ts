import type { Handler, HandlerResponse } from '@netlify/functions';
import { authenticatePassword, createAuthToken } from '../../src/utils/auth';

export const handler: Handler = async (event): Promise<HandlerResponse> => {
  const timestamp = new Date().toISOString();
  const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';

  console.log(`[${timestamp}] AUTH: Authentication request from ${clientIP}`);

  // Only allow POST requests
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
    const { password } = JSON.parse(event.body || '{}');
    console.log(`[${timestamp}] AUTH: Parsing request body from ${clientIP}`);

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

    // Authenticate the password
    const isValidPassword = authenticatePassword(password);

    if (!isValidPassword) {
      console.log(`[${timestamp}] AUTH: Invalid password attempt from ${clientIP}`);
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }

    console.log(`[${timestamp}] AUTH: Successful authentication from ${clientIP}, generating token`);

    // Generate and return JWT token
    const token = createAuthToken();

    console.log(`[${timestamp}] AUTH: Token generated and returned to ${clientIP}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, message: 'Authentication successful' })
    };
  } catch (error) {
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