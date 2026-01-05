import { Response, NextFunction } from 'express';
import { AuthService } from '../../features/auth/domain/AuthService';
import { UserRepository } from '../../features/auth/repository/UserRepository';
import { AuthenticatedRequest } from './authMiddleware';

const authService = new AuthService();

export interface AdminAuthenticatedRequest extends AuthenticatedRequest {
  isAdmin?: boolean;
}

export async function adminAuthMiddleware(
  req: AdminAuthenticatedRequest,
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

  if (!user.isAdmin) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  req.userId = user.id;
  req.isAdmin = true;
  next();
}
