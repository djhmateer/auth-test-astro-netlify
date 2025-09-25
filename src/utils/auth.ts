import jwt from 'jsonwebtoken';

// You should set this as an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// The password for accessing protected routes
const PROTECTED_PASSWORD = process.env.PROTECTED_PASSWORD || 'admin123';

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export function authenticatePassword(password: string): boolean {
  return password === PROTECTED_PASSWORD;
}

export function createAuthToken(): string {
  return generateToken({
    authenticated: true,
    timestamp: Date.now()
  });
}