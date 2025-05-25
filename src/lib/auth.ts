import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as DecodedToken;
  } catch (error) {
    return null;
  }
}

export function createToken(userId: string, isAdmin: boolean) {
  return jwt.sign(
    { userId, isAdmin },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
}
