import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../domain/AuthService';
import { UserRepository } from '../repository/UserRepository';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authService = new AuthService();

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = authService.verifyToken(token);

  if (!payload) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  const userRepository = new UserRepository();
  const user = await userRepository.findById(payload.userId);

  if (!user) {
    res.status(401).json({ message: 'User not found' });
    return;
  }

  req.userId = user.id;
  next();
}
