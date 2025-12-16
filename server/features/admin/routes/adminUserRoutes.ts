import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { User } from '../../../entity/User';
import { Order } from '../../../entity/Order';
import { ShippingAddress } from '../../../entity/ShippingAddress';
import { ProductInquiry } from '../../../entity/ProductInquiry';
import { Product } from '../../../entity/Product';

const router = Router();

interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  orderCount: number;
  createdAt: Date;
  membershipGrade: string;
  profileImage: string | null;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const userRepository = AppDataSource.getRepository(User);
    const orderRepository = AppDataSource.getRepository(Order);

    let queryBuilder = userRepository.createQueryBuilder('user');

    if (search && typeof search === 'string' && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      queryBuilder = queryBuilder.where(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: searchTerm }
      );
    }

    const totalCount = await queryBuilder.getCount();

    const users = await queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip(offset)
      .take(limitNum)
      .getMany();

    const items: AdminUserListItem[] = await Promise.all(
      users.map(async (user) => {
        const orderCount = await orderRepository.count({
          where: { userId: user.id },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          orderCount,
          createdAt: user.createdAt,
          membershipGrade: user.membershipGrade,
          profileImage: user.profileImage,
        };
      })
    );

    return res.json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Failed to get admin users:', error);
    return res.status(500).json({ error: '사용자 목록을 불러오는데 실패했습니다' });
  }
});

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userRepository = AppDataSource.getRepository(User);
    const orderRepository = AppDataSource.getRepository(Order);
    const addressRepository = AppDataSource.getRepository(ShippingAddress);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    const orderCount = await orderRepository.count({
      where: { userId: user.id },
    });

    const defaultAddress = await addressRepository.findOne({
      where: { userId: user.id, isDefault: true, isDeleted: false },
    });

    let defaultAddressText: string | null = null;
    if (defaultAddress) {
      defaultAddressText = defaultAddress.addressDetail
        ? `${defaultAddress.address} ${defaultAddress.addressDetail}`
        : defaultAddress.address;
    }

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      birthDate: user.birthDate,
      gender: user.gender,
      membershipGrade: user.membershipGrade,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      orderCount,
      defaultAddress: defaultAddressText,
    });
  } catch (error) {
    console.error('Failed to get user detail:', error);
    return res.status(500).json({ error: '사용자 정보를 불러오는데 실패했습니다' });
  }
});

router.get('/:userId/orders', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const orderRepository = AppDataSource.getRepository(Order);

    const [orders, totalCount] = await orderRepository.findAndCount({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limitNum,
    });

    const items = orders.map((order) => {
      let productSummary = '-';
      if (order.items && order.items.length > 0) {
        const firstItem = order.items[0];
        const productName = firstItem.productName || '상품';
        const optionName = firstItem.optionName;
        const remainingCount = order.items.length - 1;
        
        const firstProductDisplay = optionName 
          ? `${productName} (${optionName})`
          : productName;
        
        if (remainingCount > 0) {
          productSummary = `${firstProductDisplay} 외 ${remainingCount}건`;
        } else {
          productSummary = firstProductDisplay;
        }
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        finalAmount: order.finalAmount,
        createdAt: order.createdAt,
        productSummary,
      };
    });

    return res.json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Failed to get user orders:', error);
    return res.status(500).json({ error: '주문 내역을 불러오는데 실패했습니다' });
  }
});

router.get('/:userId/inquiries', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    const inquiryRepository = AppDataSource.getRepository(ProductInquiry);
    const productRepository = AppDataSource.getRepository(Product);

    const [inquiries, totalCount] = await inquiryRepository.findAndCount({
      where: { authorId: userId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limitNum,
    });

    const items = await Promise.all(
      inquiries.map(async (inquiry) => {
        let productName: string | null = null;
        if (inquiry.productId) {
          const product = await productRepository.findOne({
            where: { id: inquiry.productId },
            select: ['name'],
          });
          productName = product?.name || null;
        }

        return {
          id: inquiry.id,
          inquiryType: inquiry.inquiryType,
          productId: inquiry.productId,
          productName,
          question: inquiry.question,
          answer: inquiry.answer,
          isAnswered: inquiry.answer !== null,
          createdAt: inquiry.createdAt,
          answeredAt: inquiry.answeredAt,
        };
      })
    );

    return res.json({
      items,
      totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    });
  } catch (error) {
    console.error('Failed to get user inquiries:', error);
    return res.status(500).json({ error: '상품 문의를 불러오는데 실패했습니다' });
  }
});

export { router as adminUserRoutes };
