import { Handler } from '@netlify/functions';
import { authenticatePassword, createAuthToken } from '../../src/utils/auth';

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
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

    if (!password) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Password is required' }),
      };
    }

    // Authenticate the password
    const isValidPassword = authenticatePassword(password);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid password' }),
      };
    }

    // Generate and return JWT token
    const token = createAuthToken();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, message: 'Authentication successful' }),
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};