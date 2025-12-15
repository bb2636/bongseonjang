import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../../common/middleware/authMiddleware';
import { ObjectStorageService } from '../../../objectStorage';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

router.post('/review-image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.uploadFile(
      req.file.buffer,
      req.file.originalname
    );
    
    res.json({ objectPath });
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
