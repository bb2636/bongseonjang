export { AppDataSource, initializeDatabase } from './database';

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  bubbleApiToken: process.env.BUBBLE_API_TOKEN || '',
};
