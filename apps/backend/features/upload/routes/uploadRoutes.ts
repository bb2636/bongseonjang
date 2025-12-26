import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../../common/middleware/authMiddleware';
import { ObjectStorageService } from '../../../objectStorage';
import { getUploadProfile, isValidPurpose } from '../config/uploadProfiles';

interface AuthenticatedRequest extends Request {
  userId?: string;
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

    if (profile.requiresAuth && !req.userId) {
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

const MAX_REVIEW_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_REVIEW_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const reviewUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_REVIEW_IMAGE_SIZE },
});

router.post('/review-image', authMiddleware, reviewUpload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!ALLOWED_REVIEW_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      });
    }

    if (req.file.size > MAX_REVIEW_IMAGE_SIZE) {
      return res.status(400).json({ 
        error: `File too large. Maximum size: ${MAX_REVIEW_IMAGE_SIZE / 1024 / 1024}MB` 
      });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      'uploads/reviews'
    );
    
    res.json({ 
      objectPath,
      verified: true,
    });
  } catch (error) {
    console.error('Error uploading review image:', error);
    res.status(500).json({ error: 'Failed to upload review image' });
  }
});

router.get('/objects/*objectPath', async (req, res) => {
  console.log('[DEBUG] GET /objects/* called');
  console.log('[DEBUG] req.params:', JSON.stringify(req.params));
  console.log('[DEBUG] req.url:', req.url);
  
  const objectStorageService = new ObjectStorageService();
  const objectPathArr = (req.params as any).objectPath || [];
  console.log('[DEBUG] objectPathArr:', objectPathArr);
  
  const objectPath = Array.isArray(objectPathArr) ? objectPathArr.join('/') : objectPathArr;
  console.log('[DEBUG] objectPath:', objectPath);
  console.log('[DEBUG] Full path to download:', `/objects/${objectPath}`);
  
  try {
    await objectStorageService.downloadObjectByPath(`/objects/${objectPath}`, res);
    console.log('[DEBUG] Download successful for:', `/objects/${objectPath}`);
  } catch (error) {
    console.error('[DEBUG] Error serving object:', error);
    console.error('[DEBUG] Failed path:', `/objects/${objectPath}`);
    res.status(404).json({ error: 'Object not found' });
  }
});

export default router;
