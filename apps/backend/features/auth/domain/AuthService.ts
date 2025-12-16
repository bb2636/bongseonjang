import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';

const SALT_ROUNDS = 10;

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  generateToken(userId: string): string {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, config.jwtSecret) as { userId: string };
    } catch {
      return null;
    }
  }
}
