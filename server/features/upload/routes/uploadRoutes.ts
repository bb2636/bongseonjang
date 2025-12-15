import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../../common/middleware/authMiddleware';
import { ObjectStorageService } from '../../../objectStorage';
import { getUploadProfile, isValidPurpose } from '../config/uploadProfiles';

interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string };
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

const MAX_REVIEW_IMAGE_SIZE = 10 * 1024 * 1024;
const ALLOWED_REVIEW_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

router.post('/review-image/signed-url', authMiddleware, async (req, res) => {
  try {
    const { mimeType, fileSize } = req.body;
    
    if (!mimeType || typeof mimeType !== 'string') {
      return res.status(400).json({ error: 'mimeType parameter is required' });
    }

    if (!fileSize || typeof fileSize !== 'number') {
      return res.status(400).json({ error: 'fileSize parameter is required' });
    }

    if (!ALLOWED_REVIEW_MIME_TYPES.includes(mimeType)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' 
      });
    }

    if (fileSize > MAX_REVIEW_IMAGE_SIZE) {
      return res.status(400).json({ 
        error: `File too large. Maximum size: ${MAX_REVIEW_IMAGE_SIZE / 1024 / 1024}MB` 
      });
    }

    if (fileSize <= 0) {
      return res.status(400).json({ error: 'Invalid file size' });
    }

    const extension = MIME_TO_EXTENSION[mimeType];
    const objectStorageService = new ObjectStorageService();
    const { signedUrl, objectPath } = await objectStorageService.getUploadSignedUrl(
      'uploads/reviews',
      extension
    );
    
    res.json({ 
      signedUrl, 
      objectPath, 
      expectedMimeType: mimeType,
      expectedFileSize: fileSize,
    });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

router.post('/review-image/verify', authMiddleware, async (req, res) => {
  try {
    const { objectPath, expectedMimeType, expectedFileSize } = req.body;
    
    if (!objectPath || typeof objectPath !== 'string') {
      return res.status(400).json({ error: 'objectPath parameter is required' });
    }

    const objectStorageService = new ObjectStorageService();
    
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      const [metadata] = await objectFile.getMetadata();
      
      const actualSize = Number(metadata.size);
      const actualContentType = metadata.contentType || '';
      
      if (actualSize > MAX_REVIEW_IMAGE_SIZE) {
        await objectFile.delete();
        return res.status(400).json({ 
          error: `File too large. Maximum size: ${MAX_REVIEW_IMAGE_SIZE / 1024 / 1024}MB`,
          deleted: true,
        });
      }
      
      const isValidMimeType = ALLOWED_REVIEW_MIME_TYPES.some(
        allowed => actualContentType.includes(allowed.split('/')[1])
      );
      
      if (!isValidMimeType && !actualContentType.startsWith('image/')) {
        await objectFile.delete();
        return res.status(400).json({ 
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
          deleted: true,
        });
      }
      
      if (expectedFileSize && Math.abs(actualSize - expectedFileSize) > 1024) {
        console.warn(`File size mismatch for ${objectPath}: expected ${expectedFileSize}, got ${actualSize}`);
      }
      
      res.json({ 
        verified: true, 
        objectPath,
        actualSize,
        actualContentType,
      });
    } catch (error) {
      return res.status(404).json({ error: 'Object not found or upload failed' });
    }
  } catch (error) {
    console.error('Error verifying uploaded file:', error);
    res.status(500).json({ error: 'Failed to verify uploaded file' });
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
