import { Request, Response } from 'express';
import { UserApplicationService } from '../application/UserApplicationService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const userService = new UserApplicationService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ message: 'Email, password, and name are required' });
        return;
      }

      const result = await userService.register({ email, password, name });
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({ message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const result = await userService.login({ email, password });
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({ message });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const user = await userService.getUserById(req.userId);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }
}
