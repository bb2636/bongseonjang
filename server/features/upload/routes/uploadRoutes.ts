import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../../common/middleware/authMiddleware';
import { ObjectStorageService } from '../../../objectStorage';
import { getUploadProfile, isValidPurpose } from '../config/uploadProfiles';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
}

function getBaseUrl(): string {
  const customDomain = process.env.APP_DOMAIN;
  if (customDomain) {
    return `https://${customDomain}`;
  }
  
  const replitDomain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS;
  if (replitDomain) {
    return `https://${replitDomain}`;
  }
  
  return '';
}

function buildFullImageUrl(objectPath: string): string {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return objectPath;
  }
  return `${baseUrl}/api/upload${objectPath}`;
}

const router = Router();

const defaultUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authMiddleware(req, res, next);
  }
  next();
}

router.post('/', optionalAuth, defaultUpload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const purpose = req.body.purpose || req.query.purpose;
    
    if (!purpose || typeof purpose !== 'string') {
      return res.status(400).json({ error: 'purpose parameter is required' });
    }

    if (!isValidPurpose(purpose)) {
      return res.status(400).json({ error: `Invalid purpose: ${purpose}` });
    }

    const profile = getUploadProfile(purpose)!;

    if (profile.requiresAuth && !req.user) {
      return res.status(401).json({ error: 'Authentication required for this upload type' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!profile.allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${profile.allowedMimeTypes.join(', ')}` 
      });
    }

    if (req.file.size > profile.maxFileSizeBytes) {
      return res.status(400).json({ 
        error: `File too large. Maximum size: ${profile.maxFileSizeBytes / 1024 / 1024}MB` 
      });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      profile.storagePath
    );

    res.json({ objectPath, purpose });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.post('/review-image', authMiddleware, defaultUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      'uploads/reviews'
    );
    
    const fullUrl = buildFullImageUrl(objectPath);
    res.json({ objectPath: fullUrl });
  } catch (error) {
    console.error('Error uploading review image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.get('/objects/*objectPath', async (req, res) => {
  const objectStorageService = new ObjectStorageService();
  const objectPathArr = (req.params as any).objectPath || [];
  const objectPath = Array.isArray(objectPathArr) ? objectPathArr.join('/') : objectPathArr;
  try {
    await objectStorageService.downloadObjectByPath(`/objects/${objectPath}`, res);
  } catch (error) {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        `/objects/${objectPath}`
      );
      await objectStorageService.downloadObject(objectFile, res);
    } catch (fallbackError) {
      console.error('Error serving object:', error);
      res.status(404).json({ error: 'Object not found' });
    }
  }
});

export default router;
