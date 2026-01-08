import { Router } from 'express';
import { getShippingFeeByPostalCode, getShippingZone } from '../../../common/utils/shippingZone.js';

const router = Router();

router.get('/fee', (req, res) => {
  const { postalCode } = req.query;
  
  if (!postalCode || typeof postalCode !== 'string') {
    res.status(400).json({ error: '우편번호가 필요합니다' });
    return;
  }
  
  const zone = getShippingZone(postalCode);
  const shippingFee = getShippingFeeByPostalCode(postalCode);
  
  res.json({
    postalCode,
    zone,
    shippingFee,
    isIsland: zone === 'island',
  });
});

export default router;
