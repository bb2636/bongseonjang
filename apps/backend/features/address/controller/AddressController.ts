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

  async createAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { recipientName, recipientPhone, addressName, postalCode, address, addressDetail, isDefault } = req.body;

      if (!recipientName || !recipientPhone || !addressName || !postalCode || !address) {
        res.status(400).json({ error: '필수 항목을 입력해주세요' });
        return;
      }

      const newAddress = await this.shippingAddressRepository.create({
        userId,
        recipientName,
        recipientPhone,
        addressName,
        postalCode,
        address,
        addressDetail: addressDetail || null,
        isDefault: isDefault || false,
      });

      res.status(201).json({
        id: newAddress.id,
        addressName: newAddress.addressName,
        recipientName: newAddress.recipientName,
        recipientPhone: newAddress.recipientPhone,
        postalCode: newAddress.postalCode,
        address: newAddress.address,
        addressDetail: newAddress.addressDetail,
        isDefault: newAddress.isDefault,
      });
    } catch (error) {
      console.error('Failed to create address:', error);
      res.status(500).json({ error: '배송지 추가에 실패했습니다' });
    }
  }

  async updateAddress(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { recipientName, recipientPhone, addressName, postalCode, address, addressDetail, isDefault } = req.body;

      if (!recipientName || !recipientPhone || !addressName || !postalCode || !address) {
        res.status(400).json({ error: '필수 항목을 입력해주세요' });
        return;
      }

      const updatedAddress = await this.shippingAddressRepository.update(id, userId, {
        recipientName,
        recipientPhone,
        addressName,
        postalCode,
        address,
        addressDetail: addressDetail || null,
        isDefault: isDefault || false,
      });

      if (!updatedAddress) {
        res.status(404).json({ error: '배송지를 찾을 수 없습니다' });
        return;
      }

      res.json({
        id: updatedAddress.id,
        addressName: updatedAddress.addressName,
        recipientName: updatedAddress.recipientName,
        recipientPhone: updatedAddress.recipientPhone,
        postalCode: updatedAddress.postalCode,
        address: updatedAddress.address,
        addressDetail: updatedAddress.addressDetail,
        isDefault: updatedAddress.isDefault,
      });
    } catch (error) {
      console.error('Failed to update address:', error);
      res.status(500).json({ error: '배송지 수정에 실패했습니다' });
    }
  }
}
