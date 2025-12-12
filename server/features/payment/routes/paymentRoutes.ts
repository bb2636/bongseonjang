import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../../config/database';
import { Order } from '../../../entity/Order';
import { OrderItem } from '../../../entity/OrderItem';
import { Payment } from '../../../entity/Payment';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

const router = Router();

const NICEPAY_CLIENT_KEY = process.env.NICEPAY_CLIENT_KEY || '';
const NICEPAY_SECRET_KEY = process.env.NICEPAY_SECRET_KEY || '';

function getFrontendUrl(req?: Request): string {
  if (req) {
    const origin = req.headers.origin;
    if (origin) {
      return origin;
    }
    
    const referer = req.headers.referer;
    if (referer) {
      try {
        const url = new URL(referer);
        return url.origin;
      } catch {
      }
    }
    
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    if (host) {
      return `${protocol}://${host}`;
    }
  }
  
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  
  return 'http://localhost:5000';
}

function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${year}${month}${day}${random}`;
}

router.post('/prepare', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { selectedItemIds, recipientName, recipientPhone, postalCode, address, addressDetail, deliveryRequest, returnUrl: clientReturnUrl } = req.body;

    if (!selectedItemIds || !Array.isArray(selectedItemIds) || selectedItemIds.length === 0) {
      return res.status(400).json({ error: '결제할 상품을 선택해주세요' });
    }

    if (!recipientName || !recipientPhone || !postalCode || !address) {
      return res.status(400).json({ error: '배송지 정보를 입력해주세요' });
    }

    if (!clientReturnUrl) {
      return res.status(400).json({ error: '콜백 URL이 필요합니다' });
    }

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItemRepository = AppDataSource.getRepository(CartItem);
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const paymentRepository = AppDataSource.getRepository(Payment);

    const cart = await cartRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!cart) {
      return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });
    }

    const { In } = await import('typeorm');
    const cartItems = await cartItemRepository.find({
      where: { id: In(selectedItemIds), cartId: cart.id },
      relations: ['product', 'mainOption', 'subOption'],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: '선택된 상품을 찾을 수 없습니다' });
    }

    let totalProductPrice = 0;
    const goodsNames: string[] = [];

    for (const item of cartItems) {
      const basePrice = item.mainOption?.price ?? item.product?.basePrice ?? 0;
      const additionalPrice = item.subOption?.additionalPrice ?? 0;
      const unitPrice = basePrice + additionalPrice;
      totalProductPrice += unitPrice * item.quantity;
      goodsNames.push(item.product?.name ?? '상품');
    }

    const orderNumber = generateOrderNumber();
    const finalAmount = totalProductPrice;

    const cartItemIds = cartItems.map(item => item.id);

    const order = orderRepository.create({
      orderNumber,
      userId,
      status: 'pending',
      totalProductPrice,
      totalDiscountAmount: 0,
      usedPoints: 0,
      couponDiscountAmount: 0,
      finalAmount,
      earnedPoints: 0,
      recipientName,
      recipientPhone,
      postalCode,
      address,
      addressDetail: addressDetail || null,
      deliveryRequest: deliveryRequest || null,
      cartItemIdsSnapshot: cartItemIds,
    });

    await orderRepository.save(order);

    for (const item of cartItems) {
      const basePrice = item.mainOption?.price ?? item.product?.basePrice ?? 0;
      const additionalPrice = item.subOption?.additionalPrice ?? 0;
      const unitPrice = basePrice + additionalPrice;

      const orderItem = orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.product?.name ?? '',
        mainOptionName: item.mainOption?.name || null,
        subOptionName: item.subOption?.name || null,
        optionAdditionalPrice: additionalPrice,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      });

      await orderItemRepository.save(orderItem);
    }

    const payment = paymentRepository.create({
      orderId: order.id,
      status: 'pending',
      method: 'card',
      amount: finalAmount,
      pgProvider: 'nicepay',
    });

    await paymentRepository.save(payment);

    const goodsName = goodsNames.length > 1 
      ? `${goodsNames[0]} 외 ${goodsNames.length - 1}건` 
      : goodsNames[0];

    console.log('[NicePay] Prepare payment - returnUrl:', clientReturnUrl);

    return res.json({
      orderId: order.id,
      orderNumber,
      clientKey: NICEPAY_CLIENT_KEY,
      amount: finalAmount,
      goodsName,
      returnUrl: clientReturnUrl,
    });
  } catch (error) {
    console.error('Failed to prepare payment:', error);
    return res.status(500).json({ error: '결제 준비에 실패했습니다' });
  }
});

async function handlePaymentCallback(req: Request, res: Response) {
  try {
    console.log('[NicePay Callback] Method:', req.method);
    console.log('[NicePay Callback] Body:', req.body);
    console.log('[NicePay Callback] Query:', req.query);

    const data = { ...req.query, ...req.body };
    const { authResultCode, authResultMsg, tid, orderId, amount } = data as {
      authResultCode?: string;
      authResultMsg?: string;
      tid?: string;
      orderId?: string;
      amount?: string;
    };

    const frontendUrl = getFrontendUrl(req);

    console.log('[NicePay Callback] Parsed data:', { authResultCode, authResultMsg, tid, orderId, amount });
    console.log('[NicePay Callback] Frontend URL:', frontendUrl);

    if (!tid || !orderId || !amount) {
      return res.redirect(`${frontendUrl}/payment/fail?message=${encodeURIComponent('결제 정보가 누락되었습니다')}`);
    }

    if (authResultCode !== '0000') {
      return res.redirect(`${frontendUrl}/payment/fail?orderId=${orderId}&message=${encodeURIComponent(authResultMsg || '결제 인증 실패')}`);
    }

    const credentials = Buffer.from(`${NICEPAY_CLIENT_KEY}:${NICEPAY_SECRET_KEY}`).toString('base64');

    const response = await fetch(`https://sandbox-api.nicepay.co.kr/v1/payments/${tid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({ amount: parseInt(amount, 10) }),
    });

    const result = await response.json() as {
      resultCode: string;
      resultMsg: string;
      cardName?: string;
      cardNo?: string;
    };
    console.log('NicePay approval result:', result);

    const orderRepository = AppDataSource.getRepository(Order);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const order = await orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.redirect(`${frontendUrl}/payment/fail?message=${encodeURIComponent('주문을 찾을 수 없습니다')}`);
    }

    const payment = await paymentRepository.findOne({ where: { orderId } });

    if (result.resultCode === '0000') {
      console.log('[NicePay Callback] Payment approved successfully');
      
      order.status = 'paid';
      order.paidAt = new Date();
      await orderRepository.save(order);

      if (payment) {
        payment.status = 'completed';
        payment.pgTransactionId = tid;
        payment.paidAt = new Date();
        payment.cardCompany = result.cardName || null;
        payment.cardNumber = result.cardNo || null;
        await paymentRepository.save(payment);
      }

      if (order.cartItemIdsSnapshot && order.cartItemIdsSnapshot.length > 0) {
        const { In } = await import('typeorm');
        await cartItemRepository.delete({ id: In(order.cartItemIdsSnapshot) });
      }

      console.log('[NicePay Callback] Redirecting to success page');
      return res.redirect(`${frontendUrl}/payment/success?orderNumber=${order.orderNumber}`);
    } else {
      console.log('[NicePay Callback] Payment approval failed:', result.resultMsg);
      
      order.status = 'cancelled';
      await orderRepository.save(order);

      if (payment) {
        payment.status = 'failed';
        payment.failReason = result.resultMsg || '결제 승인 실패';
        await paymentRepository.save(payment);
      }

      return res.redirect(`${frontendUrl}/payment/fail?orderNumber=${order.orderNumber}&message=${encodeURIComponent(result.resultMsg || '결제 승인 실패')}`);
    }
  } catch (error) {
    console.error('[NicePay Callback] Error:', error);
    const frontendUrl = getFrontendUrl(req);
    return res.redirect(`${frontendUrl}/payment/fail?message=${encodeURIComponent('결제 처리 중 오류가 발생했습니다')}`);
  }
}

router.get('/callback', handlePaymentCallback);
router.post('/callback', handlePaymentCallback);

router.get('/order/:orderId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { orderId } = req.params;

    const orderRepository = AppDataSource.getRepository(Order);
    const order = await orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    return res.json(order);
  } catch (error) {
    console.error('Failed to get order:', error);
    return res.status(500).json({ error: '주문 조회에 실패했습니다' });
  }
});

export { router as paymentRoutes };
