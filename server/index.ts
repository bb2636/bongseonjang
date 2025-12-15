import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config, initializeDatabase } from './config';
import routes from './routes';
import { ObjectStorageService } from './objectStorage';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/objects', async (req, res, next) => {
  if (req.method !== 'GET') {
    return next();
  }
  
  const objectStorageService = new ObjectStorageService();
  const objectPath = `/objects${req.path}`;
  
  try {
    await objectStorageService.downloadObjectByPath(objectPath, res);
  } catch (error) {
    console.error('Error serving object:', error);
    res.status(404).json({ error: 'Object not found' });
  }
});

app.use('/api', routes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer(): Promise<void> {
  try {
    await initializeDatabase();
    
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
