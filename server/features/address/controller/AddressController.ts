import { Request, Response } from 'express';
import { RealShippingAddressRepository } from '../repository/RealShippingAddressRepository';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AddressController {
  private shippingAddressRepository: RealShippingAddressRepository;

  constructor() {
    this.shippingAddressRepository = new RealShippingAddressRepository();
  }

  async getAllAddresses(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const addresses = await this.shippingAddressRepository.findByUserId(userId);

      res.json(addresses.map(address => ({
        id: address.id,
        addressName: address.addressName,
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        postalCode: address.postalCode,
        address: address.address,
        addressDetail: address.addressDetail,
        isDefault: address.isDefault,
      })));
    } catch (error) {
      console.error('Failed to get addresses:', error);
      res.status(500).json({ message: 'Failed to get addresses' });
    }
  }

  async getDefaultAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const defaultAddress = await this.shippingAddressRepository.findDefaultByUserId(userId);

      if (!defaultAddress) {
        res.status(404).json({ message: 'No default address found' });
        return;
      }

      res.json({
        id: defaultAddress.id,
        addressName: defaultAddress.addressName,
        recipientName: defaultAddress.recipientName,
        recipientPhone: defaultAddress.recipientPhone,
        postalCode: defaultAddress.postalCode,
        address: defaultAddress.address,
        addressDetail: defaultAddress.addressDetail,
        isDefault: defaultAddress.isDefault,
      });
    } catch (error) {
      console.error('Failed to get default address:', error);
      res.status(500).json({ message: 'Failed to get default address' });
    }
  }
}
