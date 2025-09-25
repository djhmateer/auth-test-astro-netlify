import jwt from 'jsonwebtoken';

/**
 * AUTHENTICATION UTILITIES
 *
 * This module contains all JWT and password authentication logic.
 * These utilities are shared between the Netlify function and middleware.
 *
 * CONFIGURATION:
 * - JWT_SECRET: Cryptographic key for signing tokens (env var or fallback)
 * - PROTECTED_PASSWORD: The password required for authentication (env var or fallback)
 *
 * SECURITY NOTES:
 * - Uses hardcoded fallbacks for development (NOT secure for production)
 * - In production, set JWT_SECRET and PROTECTED_PASSWORD environment variables
 * - JWT tokens expire after 24 hours for security
 * - All operations are logged for security monitoring
 */

// Configuration with fallbacks for development
// In production, these MUST be set as environment variables in Netlify dashboard
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const PROTECTED_PASSWORD = process.env.PROTECTED_PASSWORD || '1';

/**
 * GENERATE JWT TOKEN
 *
 * Creates a signed JWT token with the provided payload and 24-hour expiration.
 * Used by createAuthToken() to generate authentication tokens.
 *
 * @param payload - Data to include in the JWT (user info, timestamp, etc.)
 * @returns Signed JWT token string
 * @throws Error if token generation fails
 */
export function generateToken(payload: any): string {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Generating JWT token`);

  try {
    // Create JWT token with 24-hour expiration and explicit HS256 algorithm
    // The token is signed with our secret key to prevent tampering
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '24h',
      algorithm: 'HS256'
    });
    console.log(`[${timestamp}] AUTH_UTILS: JWT token generated successfully`);
    return token;
  } catch (error) {
    console.error(`[${timestamp}] AUTH_UTILS: Error generating JWT token:`, error);
    throw error;
  }
}

/**
 * VERIFY JWT TOKEN
 *
 * Validates a JWT token's signature and expiration.
 * Used by middleware to verify authentication cookies.
 *
 * VERIFICATION PROCESS:
 * 1. Check token signature against JWT_SECRET
 * 2. Verify token hasn't expired
 * 3. Ensure token structure is valid
 *
 * @param token - JWT token string to verify
 * @returns true if valid, false if invalid/expired
 */
export async function verifyToken(token: string): Promise<boolean> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Verifying JWT token`);

  try {
    // Verify token signature and expiration with explicit HS256 algorithm
    // If successful, token is valid and user is authenticated
    jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    console.log(`[${timestamp}] AUTH_UTILS: JWT token verified successfully`);
    return true;
  } catch (error) {
    // Handle different types of JWT errors for better logging
    if (error instanceof jwt.TokenExpiredError) {
      console.log(`[${timestamp}] AUTH_UTILS: JWT token expired`);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log(`[${timestamp}] AUTH_UTILS: JWT token invalid`);
    } else {
      console.error(`[${timestamp}] AUTH_UTILS: Unexpected error verifying token:`, error);
    }
    return false;
  }
}

/**
 * AUTHENTICATE PASSWORD
 *
 * Simple password authentication against configured value.
 * Used by Netlify function to validate login attempts.
 *
 * SECURITY CONSIDERATIONS:
 * - Uses simple string comparison (suitable for demo)
 * - In production, should use bcrypt or similar hashing
 * - Logs all authentication attempts for monitoring
 *
 * @param password - Password provided by user
 * @returns true if valid, false if invalid
 */
export function authenticatePassword(password: string): boolean {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Authenticating password`);

  // Simple string comparison against configured password
  // In production, this should compare against hashed passwords
  const isValid = password === PROTECTED_PASSWORD;

  if (isValid) {
    console.log(`[${timestamp}] AUTH_UTILS: Password authentication successful`);
  } else {
    console.log(`[${timestamp}] AUTH_UTILS: Password authentication failed`);
  }

  return isValid;
}

/**
 * CREATE AUTHENTICATION TOKEN
 *
 * High-level function to create a complete authentication token.
 * Used by Netlify function after successful password authentication.
 *
 * TOKEN PAYLOAD:
 * - authenticated: true (indicates successful auth)
 * - timestamp: current time (for debugging/tracking)
 *
 * @returns Signed JWT token for storing in httpOnly cookie
 * @throws Error if token creation fails
 */
export function createAuthToken(): string {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Creating authentication token`);

  try {
    // Create token with authentication payload
    // This token will be stored in an httpOnly cookie
    const token = generateToken({
      authenticated: true,
      timestamp: Date.now()
    });
    console.log(`[${timestamp}] AUTH_UTILS: Authentication token created successfully`);
    return token;
  } catch (error) {
    console.error(`[${timestamp}] AUTH_UTILS: Error creating authentication token:`, error);
    throw error;
  }
}