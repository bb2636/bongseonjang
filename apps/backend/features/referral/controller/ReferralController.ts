import { Request, Response } from 'express';
import { ReferralApplicationService } from '../application/ReferralApplicationService';
import { repositories } from '../../../config/repositories';

const referralService = new ReferralApplicationService(repositories.referral);

export class ReferralController {
  async verifyReferralId(req: Request, res: Response): Promise<void> {
    try {
      const { referralId } = req.body;

      if (!referralId) {
        res.status(400).json({ 
          exists: false, 
          message: '추천인 아이디를 입력해주세요' 
        });
        return;
      }

      const result = await referralService.verifyReferralId(referralId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        exists: false, 
        message: '서버 오류가 발생했습니다' 
      });
    }
  }
}
