import { Router, Request, Response } from 'express';
import * as crypto from 'crypto';
import { AppDataSource } from '../../../config/database';
import { Order } from '../../../entity/Order';
import { OrderItem } from '../../../entity/OrderItem';
import { Payment } from '../../../entity/Payment';
import { Cart } from '../../../entity/Cart';
import { CartItem } from '../../../entity/CartItem';
import { ProductOption } from '../../../entity/ProductOption';
import { GuestOrderDetail } from '../../../entity/GuestOrderDetail';
import { Product } from '../../../entity/Product';
import { ProductImage } from '../../../entity/ProductImage';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';

function hashPhone(phone: string): string {
  return crypto.createHash('sha256').update(phone).digest('hex');
}

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
    const { selectedItemIds, recipientName, recipientPhone, postalCode, address, addressDetail, deliveryRequest, returnUrl: clientReturnUrl, paymentMethod, shippingFee = 0 } = req.body;

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
      relations: ['product', 'productOption'],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: '선택된 상품을 찾을 수 없습니다' });
    }

    const productIds = cartItems.map(item => item.productId);
    const productImageRepository = AppDataSource.getRepository(ProductImage);
    const thumbnails = await productImageRepository.find({
      where: { productId: In(productIds), isThumbnail: true },
    });
    const thumbnailMap = new Map<string, string>();
    for (const img of thumbnails) {
      thumbnailMap.set(img.productId, img.imageUrl);
    }

    let totalProductPrice = 0;
    const goodsNames: string[] = [];

    for (const item of cartItems) {
      const productBasePrice = item.product?.basePrice ?? 0;
      const additionalPrice = item.productOption?.price ?? 0;
      const unitPrice = productBasePrice + additionalPrice;
      totalProductPrice += unitPrice * item.quantity;
      goodsNames.push(item.product?.name ?? '상품');
    }

    const orderNumber = generateOrderNumber();
    const shippingAmount = Number(shippingFee) || 0;
    const finalAmount = totalProductPrice + shippingAmount;

    const cartItemIds = cartItems.map(item => item.id);

    let returnUrlOrigin: string;
    try {
      returnUrlOrigin = new URL(clientReturnUrl).origin;
    } catch {
      return res.status(400).json({ error: '올바르지 않은 콜백 URL입니다' });
    }

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
      returnUrl: returnUrlOrigin,
    });

    await orderRepository.save(order);

    for (const item of cartItems) {
      const productBasePrice = item.product?.basePrice ?? 0;
      const additionalPrice = item.productOption?.price ?? 0;
      const unitPrice = productBasePrice + additionalPrice;

      const optionDisplay = item.productOption 
        ? `${item.productOption.optionName}: ${item.productOption.optionValue}`
        : null;

      const orderItem = orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.product?.name ?? '',
        productImageUrl: thumbnailMap.get(item.productId) || null,
        optionName: optionDisplay,
        productOptionId: item.productOptionId || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      });

      await orderItemRepository.save(orderItem);
    }

    const paymentMethodMap: Record<string, 'card' | 'bank_transfer' | 'virtual_account'> = {
      'card': 'card',
      'bank': 'bank_transfer',
      'vbank': 'virtual_account',
    };
    const mappedMethod = paymentMethodMap[paymentMethod] || 'card';

    const payment = paymentRepository.create({
      orderId: order.id,
      status: 'pending',
      method: mappedMethod,
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
  const fallbackUrl = getFrontendUrl(req);
  
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

    console.log('[NicePay Callback] Parsed data:', { authResultCode, authResultMsg, tid, orderId, amount });

    if (!tid || !orderId || !amount) {
      return res.redirect(`${fallbackUrl}/payment/fail?message=${encodeURIComponent('결제 정보가 누락되었습니다')}`);
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const order = await orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.redirect(`${fallbackUrl}/payment/fail?message=${encodeURIComponent('주문을 찾을 수 없습니다')}`);
    }

    const frontendUrl = order.returnUrl || fallbackUrl;
    console.log('[NicePay Callback] Using frontend URL from order:', frontendUrl);

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
    console.log('[NicePay Callback] Approval result:', result);

    const payment = await paymentRepository.findOne({ where: { orderId } });

    if (result.resultCode === '0000') {
      console.log('[NicePay Callback] Payment approved successfully');
      
      const orderItemRepository = AppDataSource.getRepository(OrderItem);
      const productRepository = AppDataSource.getRepository(Product);
      
      const orderItems = await orderItemRepository.find({
        where: { orderId },
      });
      
      const stockCheckResult = await AppDataSource.transaction(async (transactionalEntityManager: typeof AppDataSource.manager) => {
        const insufficientStockProducts: string[] = [];
        const productUpdates: Array<{ productId: string; quantityToDeduct: number }> = [];
        const optionUpdates: Array<{ optionId: number; quantityToDeduct: number }> = [];
        
        const productQuantityMap = new Map<string, number>();
        const optionQuantityMap = new Map<number, { quantity: number; productName: string }>();
        
        for (const item of orderItems) {
          if (item.productId) {
            const currentQty = productQuantityMap.get(item.productId) || 0;
            productQuantityMap.set(item.productId, currentQty + item.quantity);
          }
          if (item.productOptionId) {
            const existing = optionQuantityMap.get(item.productOptionId);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              optionQuantityMap.set(item.productOptionId, { 
                quantity: item.quantity, 
                productName: item.productName 
              });
            }
          }
        }
        
        for (const [productId, totalQuantity] of productQuantityMap) {
          const product = await transactionalEntityManager
            .getRepository(Product)
            .createQueryBuilder('product')
            .setLock('pessimistic_write')
            .where('product.id = :id', { id: productId })
            .getOne();
          
          if (!product) {
            insufficientStockProducts.push(`상품을 찾을 수 없음 (ID: ${productId})`);
            continue;
          }
          
          if (product.stockQuantity < totalQuantity) {
            insufficientStockProducts.push(`${product.name} (재고: ${product.stockQuantity}, 필요: ${totalQuantity})`);
          } else {
            productUpdates.push({ productId, quantityToDeduct: totalQuantity });
          }
        }
        
        for (const [optionId, { quantity: totalQuantity, productName }] of optionQuantityMap) {
          const option = await transactionalEntityManager
            .getRepository(ProductOption)
            .createQueryBuilder('option')
            .setLock('pessimistic_write')
            .where('option.id = :optionId', { optionId })
            .getOne();
          
          if (!option) {
            insufficientStockProducts.push(`옵션을 찾을 수 없음 (ID: ${optionId})`);
            continue;
          }
          
          if (option.stockQuantity < totalQuantity) {
            insufficientStockProducts.push(`${productName} - ${option.optionName}: ${option.optionValue} (재고: ${option.stockQuantity}, 필요: ${totalQuantity})`);
          } else {
            optionUpdates.push({ optionId, quantityToDeduct: totalQuantity });
          }
        }
        
        if (insufficientStockProducts.length > 0) {
          return { success: false, insufficientProducts: insufficientStockProducts };
        }
        
        for (const update of productUpdates) {
          await transactionalEntityManager
            .getRepository(Product)
            .decrement({ id: update.productId }, 'stockQuantity', update.quantityToDeduct);
        }
        
        for (const update of optionUpdates) {
          await transactionalEntityManager
            .getRepository(ProductOption)
            .decrement({ id: update.optionId }, 'stockQuantity', update.quantityToDeduct);
        }
        
        return { success: true, insufficientProducts: [] };
      });
      
      if (!stockCheckResult.success) {
        console.log('[NicePay Callback] Stock insufficient, cancelling payment:', stockCheckResult.insufficientProducts);
        
        const cancelResponse = await fetch(`https://sandbox-api.nicepay.co.kr/v1/payments/${tid}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`,
          },
          body: JSON.stringify({
            reason: '재고 부족으로 인한 주문 취소',
            orderId: orderId,
          }),
        });
        
        const cancelResult = await cancelResponse.json() as { resultCode: string; resultMsg: string };
        console.log('[NicePay Callback] Cancel result:', cancelResult);
        
        order.status = 'stock_insufficient';
        await orderRepository.save(order);
        
        if (payment) {
          payment.status = 'cancelled';
          payment.pgTransactionId = tid;
          payment.failReason = `재고 부족: ${stockCheckResult.insufficientProducts.join(', ')}`;
          await paymentRepository.save(payment);
        }
        
        const errorMessage = `재고 부족: ${stockCheckResult.insufficientProducts.join(', ')}`;
        return res.redirect(`${frontendUrl}/payment/fail?orderNumber=${order.orderNumber}&message=${encodeURIComponent(errorMessage)}`);
      }
      
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

      console.log('[NicePay Callback] Redirecting to success:', `${frontendUrl}/payment/complete/${order.id}`);
      return res.redirect(`${frontendUrl}/payment/complete/${order.id}`);
    } else {
      console.log('[NicePay Callback] Payment approval failed:', result.resultMsg);
      
      order.status = 'payment_failed';
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
    return res.redirect(`${fallbackUrl}/payment/fail?message=${encodeURIComponent('결제 처리 중 오류가 발생했습니다')}`);
  }
}

router.get('/callback', handlePaymentCallback);
router.post('/callback', handlePaymentCallback);

interface DirectPurchaseItem {
  productOptionId: number | null;
  quantity: number;
}

router.post('/prepare-direct', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.userId;
    const { 
      productId, 
      items, 
      recipientName, 
      recipientPhone, 
      postalCode, 
      address, 
      addressDetail, 
      deliveryRequest, 
      returnUrl: clientReturnUrl, 
      paymentMethod,
      shippingFee = 0
    } = req.body;

    if (!productId) {
      return res.status(400).json({ error: '상품 정보가 필요합니다' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '구매할 옵션을 선택해주세요' });
    }

    if (!recipientName || !recipientPhone || !postalCode || !address) {
      return res.status(400).json({ error: '배송지 정보를 입력해주세요' });
    }

    if (!clientReturnUrl) {
      return res.status(400).json({ error: '콜백 URL이 필요합니다' });
    }

    const { Product } = await import('../../../entity/Product');
    
    const productRepository = AppDataSource.getRepository(Product);
    const productOptionRepository = AppDataSource.getRepository(ProductOption);
    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const paymentRepository = AppDataSource.getRepository(Payment);

    const product = await productRepository.findOne({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    }

    const productImageRepository = AppDataSource.getRepository(ProductImage);
    const thumbnail = await productImageRepository.findOne({
      where: { productId, isThumbnail: true },
    });
    const productImageUrl = thumbnail?.imageUrl || null;

    let totalProductPrice = 0;
    const orderItemsData: Array<{
      productId: string;
      productName: string;
      productImageUrl: string | null;
      optionName: string | null;
      productOptionId: number | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of items as DirectPurchaseItem[]) {
      let optionDisplay: string | null = null;
      let unitPrice = product.basePrice;

      if (item.productOptionId) {
        const option = await productOptionRepository.findOne({ where: { id: item.productOptionId } });
        if (option) {
          optionDisplay = `${option.optionName}: ${option.optionValue}`;
          if (option.price !== null && option.price > 0) {
            unitPrice = product.basePrice + option.price;
          }
        }
      }
      const itemTotal = unitPrice * item.quantity;
      totalProductPrice += itemTotal;

      orderItemsData.push({
        productId,
        productName: product.name,
        productImageUrl,
        optionName: optionDisplay,
        productOptionId: item.productOptionId || null,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal,
      });
    }

    const orderNumber = generateOrderNumber();
    const shippingAmount = Number(shippingFee) || 0;
    const finalAmount = totalProductPrice + shippingAmount;

    let returnUrlOrigin: string;
    try {
      returnUrlOrigin = new URL(clientReturnUrl).origin;
    } catch {
      return res.status(400).json({ error: '올바르지 않은 콜백 URL입니다' });
    }

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
      cartItemIdsSnapshot: [],
      returnUrl: returnUrlOrigin,
    });

    await orderRepository.save(order);

    for (const itemData of orderItemsData) {
      const orderItem = orderItemRepository.create({
        orderId: order.id,
        ...itemData,
      });
      await orderItemRepository.save(orderItem);
    }

    const paymentMethodMap: Record<string, 'card' | 'bank_transfer' | 'virtual_account'> = {
      'card': 'card',
      'bank': 'bank_transfer',
      'vbank': 'virtual_account',
    };
    const mappedMethod = paymentMethodMap[paymentMethod] || 'card';

    const payment = paymentRepository.create({
      orderId: order.id,
      status: 'pending',
      method: mappedMethod,
      amount: finalAmount,
      pgProvider: 'nicepay',
    });

    await paymentRepository.save(payment);

    const goodsName = orderItemsData.length > 1 
      ? `${product.name} 외 ${orderItemsData.length - 1}건` 
      : product.name;

    console.log('[NicePay] Prepare direct payment - returnUrl:', clientReturnUrl);

    return res.json({
      orderId: order.id,
      orderNumber,
      clientKey: NICEPAY_CLIENT_KEY,
      amount: finalAmount,
      goodsName,
      returnUrl: clientReturnUrl,
    });
  } catch (error) {
    console.error('Failed to prepare direct payment:', error);
    return res.status(500).json({ error: '결제 준비에 실패했습니다' });
  }
});

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

interface GuestCartItem {
  productId: string;
  productName: string;
  optionId: string | null;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  thumbnailUrl: string;
}

router.post('/prepare-guest', async (req: Request, res: Response) => {
  try {
    const { 
      cartItems,
      guestName,
      guestPhone,
      guestEmail,
      recipientName, 
      recipientPhone, 
      postalCode, 
      address, 
      addressDetail, 
      deliveryRequest, 
      returnUrl: clientReturnUrl, 
      paymentMethod,
      shippingFee = 0
    } = req.body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: '결제할 상품을 선택해주세요' });
    }

    if (!guestName || !guestPhone) {
      return res.status(400).json({ error: '주문자 정보를 입력해주세요' });
    }

    if (!recipientName || !recipientPhone || !postalCode || !address) {
      return res.status(400).json({ error: '배송지 정보를 입력해주세요' });
    }

    if (!clientReturnUrl) {
      return res.status(400).json({ error: '콜백 URL이 필요합니다' });
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const guestOrderDetailRepository = AppDataSource.getRepository(GuestOrderDetail);

    let totalProductPrice = 0;
    const goodsNames: string[] = [];

    for (const item of cartItems as GuestCartItem[]) {
      totalProductPrice += item.totalPrice;
      goodsNames.push(item.productName);
    }

    const orderNumber = generateOrderNumber();
    const shippingAmount = Number(shippingFee) || 0;
    const finalAmount = totalProductPrice + shippingAmount;

    let returnUrlOrigin: string;
    try {
      returnUrlOrigin = new URL(clientReturnUrl).origin;
    } catch {
      return res.status(400).json({ error: '올바르지 않은 콜백 URL입니다' });
    }

    const order = orderRepository.create({
      orderNumber,
      userId: null,
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
      cartItemIdsSnapshot: [],
      returnUrl: returnUrlOrigin,
    });

    await orderRepository.save(order);

    for (const item of cartItems as GuestCartItem[]) {
      const orderItem = orderItemRepository.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName,
        productImageUrl: item.thumbnailUrl || null,
        optionName: item.optionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
      await orderItemRepository.save(orderItem);
    }

    const guestOrderDetail = guestOrderDetailRepository.create({
      orderId: order.id,
      guestName,
      guestPhoneHash: hashPhone(guestPhone),
      guestPhoneLast4: guestPhone.slice(-4),
      guestEmail: guestEmail || null,
    });
    await guestOrderDetailRepository.save(guestOrderDetail);

    const paymentMethodMap: Record<string, 'card' | 'bank_transfer' | 'virtual_account'> = {
      'card': 'card',
      'bank': 'bank_transfer',
      'vbank': 'virtual_account',
    };
    const mappedMethod = paymentMethodMap[paymentMethod] || 'card';

    const payment = paymentRepository.create({
      orderId: order.id,
      status: 'pending',
      method: mappedMethod,
      amount: finalAmount,
      pgProvider: 'nicepay',
    });

    await paymentRepository.save(payment);

    const goodsName = goodsNames.length > 1 
      ? `${goodsNames[0]} 외 ${goodsNames.length - 1}건` 
      : goodsNames[0];

    console.log('[NicePay] Prepare guest payment - returnUrl:', clientReturnUrl);

    return res.json({
      orderId: order.id,
      orderNumber,
      clientKey: NICEPAY_CLIENT_KEY,
      amount: finalAmount,
      goodsName,
      returnUrl: clientReturnUrl,
    });
  } catch (error) {
    console.error('Failed to prepare guest payment:', error);
    return res.status(500).json({ error: '결제 준비에 실패했습니다' });
  }
});

router.post('/guest/lookup', async (req: Request, res: Response) => {
  try {
    const { guestName, guestPhone } = req.body;

    if (!guestName || !guestPhone) {
      return res.status(400).json({ error: '주문자 이름과 휴대폰 번호를 입력해주세요' });
    }

    const phoneHash = hashPhone(guestPhone);

    const guestOrderDetailRepository = AppDataSource.getRepository(GuestOrderDetail);
    const orderRepository = AppDataSource.getRepository(Order);

    const guestDetails = await guestOrderDetailRepository.find({
      where: { 
        guestName,
        guestPhoneHash: phoneHash,
      },
    });

    if (guestDetails.length === 0) {
      return res.json({ orders: [] });
    }

    const orderIds = guestDetails.map(g => g.orderId);
    const { In } = await import('typeorm');
    
    const orders = await orderRepository.find({
      where: { id: In(orderIds) },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });

    const ordersWithGuestInfo = orders.map(order => {
      const guestDetail = guestDetails.find(g => g.orderId === order.id);
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalProductPrice: order.totalProductPrice,
        finalAmount: order.finalAmount,
        recipientName: order.recipientName,
        recipientPhone: order.recipientPhone.slice(0, -4) + '****',
        address: order.address,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          optionName: item.optionName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        isClaimed: !!guestDetail?.claimedUserId,
      };
    });

    return res.json({ orders: ordersWithGuestInfo });
  } catch (error) {
    console.error('Failed to lookup guest orders:', error);
    return res.status(500).json({ error: '주문 조회에 실패했습니다' });
  }
});

router.get('/guest/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const orderRepository = AppDataSource.getRepository(Order);
    const guestOrderDetailRepository = AppDataSource.getRepository(GuestOrderDetail);

    const order = await orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    const guestDetail = await guestOrderDetailRepository.findOne({
      where: { orderId },
    });

    if (!guestDetail) {
      return res.status(403).json({ error: '비회원 주문이 아닙니다' });
    }

    return res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalProductPrice: order.totalProductPrice,
      finalAmount: order.finalAmount,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      postalCode: order.postalCode,
      address: order.address,
      addressDetail: order.addressDetail,
      deliveryRequest: order.deliveryRequest,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        optionName: item.optionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    });
  } catch (error) {
    console.error('Failed to get guest order:', error);
    return res.status(500).json({ error: '주문 조회에 실패했습니다' });
  }
});

export { router as paymentRoutes };
