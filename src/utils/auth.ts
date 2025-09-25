import jwt from 'jsonwebtoken';

// You should set this as an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// The password for accessing protected routes
const PROTECTED_PASSWORD = process.env.PROTECTED_PASSWORD || '1';

export function generateToken(payload: any): string {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Generating JWT token`);

  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    console.log(`[${timestamp}] AUTH_UTILS: JWT token generated successfully`);
    return token;
  } catch (error) {
    console.error(`[${timestamp}] AUTH_UTILS: Error generating JWT token:`, error);
    throw error;
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Verifying JWT token`);

  try {
    jwt.verify(token, JWT_SECRET);
    console.log(`[${timestamp}] AUTH_UTILS: JWT token verified successfully`);
    return true;
  } catch (error) {
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

export function authenticatePassword(password: string): boolean {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Authenticating password`);

  const isValid = password === PROTECTED_PASSWORD;

  if (isValid) {
    console.log(`[${timestamp}] AUTH_UTILS: Password authentication successful`);
  } else {
    console.log(`[${timestamp}] AUTH_UTILS: Password authentication failed`);
  }

  return isValid;
}

export function createAuthToken(): string {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AUTH_UTILS: Creating authentication token`);

  try {
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