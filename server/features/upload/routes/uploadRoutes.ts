import { Router } from 'express';
import { authMiddleware } from '../../../common/middleware/authMiddleware';
import { ObjectStorageService } from '../../../objectStorage';

const router = Router();

router.post('/review-image', authMiddleware, async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
});

router.post('/confirm-review-image', authMiddleware, async (req, res) => {
  const { imageURL } = req.body;
  
  if (!imageURL) {
    return res.status(400).json({ error: 'imageURL is required' });
  }

  try {
    const userId = (req as any).userId;
    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      imageURL,
      {
        owner: userId,
        visibility: 'public',
      }
    );

    res.json({ objectPath });
  } catch (error) {
    console.error('Error confirming review image:', error);
    res.status(500).json({ error: 'Failed to confirm review image' });
  }
});

router.get('/objects/:objectPath(*)', async (req, res) => {
  const objectStorageService = new ObjectStorageService();
  try {
    const objectFile = await objectStorageService.getObjectEntityFile(
      `/objects/${req.params.objectPath}`
    );
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error('Error serving object:', error);
    res.status(404).json({ error: 'Object not found' });
  }
});

export default router;
