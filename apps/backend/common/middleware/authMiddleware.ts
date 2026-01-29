import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../features/auth/domain/AuthService';
import { UserRepository } from '../../features/auth/repository/UserRepository';

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

  if (user.isSuspended) {
    res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: '활동이 정지된 계정입니다.' });
    return;
  }

  req.userId = user.id;
  next();
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = authHeader.substring(7);
  const payload = authService.verifyToken(token);

  if (!payload) {
    next();
    return;
  }

  const userRepository = new UserRepository();
  const user = await userRepository.findById(payload.userId);

  if (user && !user.isSuspended) {
    req.userId = user.id;
  }

  next();
}
