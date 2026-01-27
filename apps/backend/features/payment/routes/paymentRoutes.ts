import { Router, Request, Response } from 'express';
import { In } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
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
import { ProductExposureCategory } from '../../../entity/ProductExposureCategory';
import { ProductCategory } from '../../../entity/ProductCategory';
import { authMiddleware, AuthenticatedRequest } from '../../../common/middleware/authMiddleware';
import { CouponRepository } from '../../coupon/repository/CouponRepository';
import { toAbsoluteImageUrl } from '../../../common/utils/imageUrl';

const BRAND_CATEGORY_MAPPING: Record<string, string> = {
  '바담은': '바담은 제품',
  '오바다': '오바다 제품',
  '포시즌': '포시즌 제품',
  '봉쿡': '봉쿡 제품',
};

async function getBrandExposureNamesForTargetCategories(
  targetCategoryIds: string[]
): Promise<string[]> {
  const productCategoryRepo = AppDataSource.getRepository(ProductCategory);
  const targetCategories = await productCategoryRepo.find({
    where: { id: In(targetCategoryIds) },
    select: ['id', 'name'],
  });
  
  return targetCategories
    .filter(cat => BRAND_CATEGORY_MAPPING[cat.name])
    .map(cat => BRAND_CATEGORY_MAPPING[cat.name]);
}

async function checkProductMatchesTargetCategories(
  productId: string,
  productCategoryId: string | null,
  targetCategoryIds: string[],
  targetBrandExposureNames: string[],
  targetExposureCategoryIds: number[] = []
): Promise<boolean> {
  if (productCategoryId && targetCategoryIds.includes(productCategoryId)) {
    return true;
  }
  
  const pecRepo = AppDataSource.getRepository(ProductExposureCategory);
  const productExposureCategories = await pecRepo.find({
    where: { productId },
    relations: ['exposureCategory'],
  });
  
  for (const pec of productExposureCategories) {
    if (pec.exposureCategory) {
      if (targetBrandExposureNames.includes(pec.exposureCategory.name)) {
        return true;
      }
      if (targetExposureCategoryIds.includes(Number(pec.exposureCategory.id))) {
        return true;
      }
    }
  }
  
  if (targetBrandExposureNames.length === 0 && targetExposureCategoryIds.length === 0 && targetCategoryIds.length === 0) {
    return true;
  }
  
  return false;
}

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
    const { selectedItemIds, recipientName, recipientPhone, postalCode, address, addressDetail, deliveryRequest, returnUrl: clientReturnUrl, paymentMethod, shippingFee = 0, userCouponIds: rawUserCouponIds, userCouponId: legacyUserCouponId, usedPoints = 0 } = req.body;
    
    let userCouponIds: number[] = [];
    if (Array.isArray(rawUserCouponIds)) {
      userCouponIds = rawUserCouponIds.map((id: unknown) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);
    } else if (legacyUserCouponId) {
      userCouponIds = [Number(legacyUserCouponId)];
    }

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

    const cartItems = await cartItemRepository.find({
      where: { id: In(selectedItemIds), cartId: cart.id },
      relations: ['product', 'productOption'],
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: '선택된 상품을 찾을 수 없습니다' });
    }

    const insufficientStockItems: string[] = [];
    for (const item of cartItems) {
      if (item.productOption) {
        if (item.productOption.stockQuantity < item.quantity) {
          const optionName = `${item.productOption.optionName}: ${item.productOption.optionValue}`;
          if (item.productOption.stockQuantity <= 0) {
            insufficientStockItems.push(`${item.product?.name} - ${optionName} (품절)`);
          } else {
            insufficientStockItems.push(`${item.product?.name} - ${optionName} (재고: ${item.productOption.stockQuantity}개)`);
          }
        }
      } else if (item.product) {
        if (item.product.stockQuantity < item.quantity) {
          if (item.product.stockQuantity <= 0) {
            insufficientStockItems.push(`${item.product.name} (품절)`);
          } else {
            insufficientStockItems.push(`${item.product.name} (재고: ${item.product.stockQuantity}개)`);
          }
        }
      }
    }

    if (insufficientStockItems.length > 0) {
      return res.status(400).json({ 
        error: `재고가 부족합니다: ${insufficientStockItems.join(', ')}` 
      });
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
    
    let couponDiscountAmount = 0;
    const appliedUserCouponIds: number[] = [];
    const couponRepository = new CouponRepository();
    
    if (userCouponIds.length > 0) {
      const now = new Date();
      let shippingDiscountApplied = false;
      
      for (const userCouponId of userCouponIds) {
        const userCoupon = await couponRepository.getUserCouponById(userCouponId);
        
        if (!userCoupon) {
          return res.status(400).json({ error: '쿠폰을 찾을 수 없습니다' });
        }
        
        if (userCoupon.userId !== userId) {
          return res.status(400).json({ error: '본인의 쿠폰만 사용할 수 있습니다' });
        }
        
        if (userCoupon.status !== 'ISSUED') {
          return res.status(400).json({ error: '이미 사용되었거나 만료된 쿠폰입니다' });
        }
        
        if (userCoupon.validFrom && now < userCoupon.validFrom) {
          return res.status(400).json({ error: '아직 사용할 수 없는 쿠폰입니다' });
        }
        
        if (userCoupon.validTo && now > userCoupon.validTo) {
          return res.status(400).json({ error: '유효기간이 지난 쿠폰입니다' });
        }
        
        const couponDetails = await couponRepository.findCouponById(userCoupon.couponId);
        
        if (!couponDetails || !couponDetails.isActive) {
          return res.status(400).json({ error: '사용할 수 없는 쿠폰입니다' });
        }
        
        if (userCouponIds.length > 1 && !couponDetails.allowMultipleUse) {
          return res.status(400).json({ error: '해당 쿠폰은 다른 쿠폰과 함께 사용할 수 없습니다' });
        }
        
        if (couponDetails.minOrderAmount > totalProductPrice) {
          return res.status(400).json({ 
            error: `최소 주문 금액 ${couponDetails.minOrderAmount.toLocaleString()}원 이상 구매 시 사용 가능합니다` 
          });
        }
        
        let applicableSubtotal = totalProductPrice;
        
        if (couponDetails.targetType === 'category') {
          const targetCategoryIds = await couponRepository.getCouponTargetCategories(couponDetails.id);
          const targetExposureCategoryIds = await couponRepository.getCouponTargetExposureCategories(couponDetails.id);
          if (targetCategoryIds.length > 0 || targetExposureCategoryIds.length > 0) {
            const targetBrandExposureNames = await getBrandExposureNamesForTargetCategories(targetCategoryIds);
            
            let highestLineTotal = 0;
            for (const item of cartItems) {
              if (!item.product) continue;
              const matches = await checkProductMatchesTargetCategories(
                item.product.id,
                item.product.productCategoryId,
                targetCategoryIds,
                targetBrandExposureNames,
                targetExposureCategoryIds
              );
              if (matches) {
                const productBasePrice = item.product.basePrice ?? 0;
                const additionalPrice = item.productOption?.price ?? 0;
                const unitPrice = productBasePrice + additionalPrice;
                const lineTotal = unitPrice * item.quantity;
                if (lineTotal > highestLineTotal) {
                  highestLineTotal = lineTotal;
                }
              }
            }
            
            if (highestLineTotal === 0) {
              return res.status(400).json({ 
                error: '해당 쿠폰은 지정된 카테고리 상품에만 적용됩니다. 적용 가능한 상품이 없습니다.' 
              });
            }
            
            applicableSubtotal = highestLineTotal;
          }
        }
        
        const remainingPayable = totalProductPrice - couponDiscountAmount;
        
        let thisCouponDiscount = 0;
        if (couponDetails.discountType === 'fixed') {
          thisCouponDiscount = Math.min(couponDetails.discountValue, applicableSubtotal, remainingPayable);
        } else if (couponDetails.discountType === 'rate') {
          thisCouponDiscount = Math.floor(applicableSubtotal * (couponDetails.discountValue / 100));
          if (couponDetails.maxDiscountAmount && thisCouponDiscount > couponDetails.maxDiscountAmount) {
            thisCouponDiscount = couponDetails.maxDiscountAmount;
          }
          thisCouponDiscount = Math.min(thisCouponDiscount, remainingPayable);
        } else if (couponDetails.discountType === 'shipping') {
          if (!shippingDiscountApplied) {
            thisCouponDiscount = shippingAmount;
            shippingDiscountApplied = true;
          }
        }
        
        couponDiscountAmount += thisCouponDiscount;
        appliedUserCouponIds.push(userCoupon.id);
      }
    }
    
    const validatedUsedPoints = Math.max(0, Math.min(usedPoints, totalProductPrice + shippingAmount - couponDiscountAmount));
    const finalAmount = Math.max(0, totalProductPrice + shippingAmount - couponDiscountAmount - validatedUsedPoints);

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
      usedPoints: validatedUsedPoints,
      couponDiscountAmount,
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
      userCouponId: appliedUserCouponIds.length > 0 ? appliedUserCouponIds[0] : null,
      userCouponIdsJson: appliedUserCouponIds.length > 0 ? JSON.stringify(appliedUserCouponIds) : null,
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
        productImageUrl: toAbsoluteImageUrl(thumbnailMap.get(item.productId)) || null,
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

router.get('/form/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const appScheme = req.query.appScheme as string | undefined;

    const orderRepository = AppDataSource.getRepository(Order);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const orderItemRepository = AppDataSource.getRepository(OrderItem);

    const order = await orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).send('주문을 찾을 수 없습니다');
    }

    const payment = await paymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      return res.status(404).send('결제 정보를 찾을 수 없습니다');
    }

    if (order.status !== 'pending') {
      return res.status(400).send('이미 처리된 주문입니다');
    }

    const orderItems = await orderItemRepository.find({
      where: { orderId },
    });

    const goodsName = orderItems.length > 1
      ? `${orderItems[0].productName} 외 ${orderItems.length - 1}건`
      : orderItems[0]?.productName || '상품';

    const methodMap: Record<string, string> = {
      'card': 'card',
      'bank': 'bank',
      'vbank': 'vbank',
      'bank_transfer': 'bank',
      'virtual_account': 'vbank',
    };
    const paymentMethod = methodMap[payment.method] || 'card';

    const baseUrl = getFrontendUrl(req);
    const returnUrl = appScheme 
      ? `${baseUrl}/api/payment/callback?appScheme=${appScheme}`
      : `${baseUrl}/api/payment/callback`;

    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>결제 진행중</title>
  <script src="https://pay.nicepay.co.kr/v1/js/"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .loading {
      text-align: center;
      padding: 40px;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .message {
      color: #666;
      font-size: 16px;
    }
    .error {
      color: #dc2626;
      background: #fef2f2;
      padding: 20px;
      border-radius: 8px;
      max-width: 300px;
      margin: 20px auto;
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p class="message">결제창을 불러오는 중입니다...</p>
  </div>
  <div id="error-container"></div>
  
  <script>
    (function() {
      const paymentConfig = {
        clientId: '${NICEPAY_CLIENT_KEY}',
        method: '${paymentMethod}',
        orderId: '${orderId}',
        amount: ${order.finalAmount},
        goodsName: '${goodsName.replace(/'/g, "\\'")}',
        returnUrl: '${returnUrl}',
        ${paymentMethod === 'vbank' ? `vbankHolder: '${order.recipientName.replace(/'/g, "\\'")}',` : ''}
        fnError: function(result) {
          document.querySelector('.loading').style.display = 'none';
          document.getElementById('error-container').innerHTML = 
            '<div class="error">' +
            '<strong>결제 오류</strong><br>' +
            (result.errorMsg || '결제를 진행할 수 없습니다') +
            '</div>';
        }
      };

      setTimeout(function() {
        if (window.AUTHNICE && window.AUTHNICE.requestPay) {
          window.AUTHNICE.requestPay(paymentConfig);
        } else {
          document.querySelector('.loading').style.display = 'none';
          document.getElementById('error-container').innerHTML = 
            '<div class="error">결제 모듈을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</div>';
        }
      }, 500);
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(html);
  } catch (error) {
    console.error('Failed to serve payment form:', error);
    return res.status(500).send('결제 페이지를 불러올 수 없습니다');
  }
});

async function handlePaymentCallback(req: Request, res: Response) {
  const fallbackUrl = getFrontendUrl(req);
  
  try {
    console.log('[NicePay Callback] Method:', req.method);
    console.log('[NicePay Callback] Body:', req.body);
    console.log('[NicePay Callback] Query:', req.query);

    const data = { ...req.query, ...req.body };
    const { authResultCode, authResultMsg, tid, orderId, amount, appScheme } = data as {
      authResultCode?: string;
      authResultMsg?: string;
      tid?: string;
      orderId?: string;
      amount?: string;
      appScheme?: string;
    };

    console.log('[NicePay Callback] Parsed data:', { authResultCode, authResultMsg, tid, orderId, amount, appScheme });

    const buildRedirectUrl = (path: string, params?: Record<string, string>) => {
      const queryString = params 
        ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
        : '';
      
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      
      if (appScheme) {
        return `${appScheme}://${cleanPath}${queryString}`;
      }
      return `${fallbackUrl}/${cleanPath}${queryString}`;
    };

    if (!tid || !orderId || !amount) {
      return res.redirect(buildRedirectUrl('/payment/fail', { message: '결제 정보가 누락되었습니다' }));
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const cartItemRepository = AppDataSource.getRepository(CartItem);

    const order = await orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      return res.redirect(buildRedirectUrl('/payment/fail', { message: '주문을 찾을 수 없습니다' }));
    }

    const frontendUrl = appScheme ? null : (order.returnUrl || fallbackUrl);
    console.log('[NicePay Callback] Using frontend URL from order:', frontendUrl, 'appScheme:', appScheme);
    
    const buildOrderRedirectUrl = (path: string, params?: Record<string, string>) => {
      const queryString = params 
        ? '?' + Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
        : '';
      
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      
      if (appScheme) {
        return `${appScheme}://${cleanPath}${queryString}`;
      }
      return `${frontendUrl}/${cleanPath}${queryString}`;
    };

    if (authResultCode !== '0000') {
      return res.redirect(buildOrderRedirectUrl('/payment/fail', { orderId, message: authResultMsg || '결제 인증 실패' }));
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
        return res.redirect(buildOrderRedirectUrl('/payment/fail', { orderNumber: order.orderNumber, message: errorMessage }));
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

      if (order.userCouponIdsJson) {
        const couponRepository = new CouponRepository();
        const couponIds: number[] = JSON.parse(order.userCouponIdsJson);
        for (const couponId of couponIds) {
          await couponRepository.useUserCoupon(couponId, order.id);
        }
      } else if (order.userCouponId) {
        const couponRepository = new CouponRepository();
        await couponRepository.useUserCoupon(order.userCouponId, order.id);
      }

      if (order.cartItemIdsSnapshot && order.cartItemIdsSnapshot.length > 0) {
            await cartItemRepository.delete({ id: In(order.cartItemIdsSnapshot) });
      }

      const successUrl = buildOrderRedirectUrl(`/payment/complete/${order.id}`);
      console.log('[NicePay Callback] Redirecting to success:', successUrl);
      return res.redirect(successUrl);
    } else {
      console.log('[NicePay Callback] Payment approval failed:', result.resultMsg);
      
      order.status = 'payment_failed';
      await orderRepository.save(order);

      if (payment) {
        payment.status = 'failed';
        payment.failReason = result.resultMsg || '결제 승인 실패';
        await paymentRepository.save(payment);
      }

      return res.redirect(buildOrderRedirectUrl('/payment/fail', { orderNumber: order.orderNumber, message: result.resultMsg || '결제 승인 실패' }));
    }
  } catch (error) {
    console.error('[NicePay Callback] Error:', error);
    const catchData = { ...req.query, ...req.body };
    const appSchemeFromCatch = catchData.appScheme as string | undefined;
    if (appSchemeFromCatch) {
      return res.redirect(`${appSchemeFromCatch}://payment/fail?message=${encodeURIComponent('결제 처리 중 오류가 발생했습니다')}`);
    }
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
      shippingFee = 0,
      userCouponIds: rawUserCouponIds,
      userCouponId: legacyUserCouponId,
      usedPoints = 0
    } = req.body;
    
    let userCouponIds: number[] = [];
    if (Array.isArray(rawUserCouponIds)) {
      userCouponIds = rawUserCouponIds.map((id: unknown) => Number(id)).filter((id: number) => !isNaN(id) && id > 0);
    } else if (legacyUserCouponId) {
      userCouponIds = [Number(legacyUserCouponId)];
    }

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

    const insufficientStockItems: string[] = [];
    for (const item of items as DirectPurchaseItem[]) {
      if (item.productOptionId) {
        const option = await productOptionRepository.findOne({ where: { id: item.productOptionId } });
        if (!option) {
          return res.status(400).json({ error: '선택한 옵션을 찾을 수 없습니다' });
        }
        if (option.stockQuantity < item.quantity) {
          if (option.stockQuantity <= 0) {
            insufficientStockItems.push(`${option.optionName}: ${option.optionValue} (품절)`);
          } else {
            insufficientStockItems.push(`${option.optionName}: ${option.optionValue} (재고: ${option.stockQuantity}개)`);
          }
        }
      } else {
        if (product.stockQuantity < item.quantity) {
          if (product.stockQuantity <= 0) {
            insufficientStockItems.push(`${product.name} (품절)`);
          } else {
            insufficientStockItems.push(`${product.name} (재고: ${product.stockQuantity}개)`);
          }
        }
      }
    }

    if (insufficientStockItems.length > 0) {
      return res.status(400).json({ 
        error: `재고가 부족합니다: ${insufficientStockItems.join(', ')}` 
      });
    }

    const productImageRepository = AppDataSource.getRepository(ProductImage);
    const thumbnail = await productImageRepository.findOne({
      where: { productId, isThumbnail: true },
    });
    const productImageUrl = toAbsoluteImageUrl(thumbnail?.imageUrl) || null;

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
    
    let couponDiscountAmount = 0;
    const appliedUserCouponIds: number[] = [];
    const couponRepository = new CouponRepository();
    
    if (userCouponIds.length > 0) {
      const now = new Date();
      let shippingDiscountApplied = false;
      
      for (const userCouponId of userCouponIds) {
        const userCoupon = await couponRepository.getUserCouponById(userCouponId);
        
        if (!userCoupon) {
          return res.status(400).json({ error: '쿠폰을 찾을 수 없습니다' });
        }
        
        if (userCoupon.userId !== userId) {
          return res.status(400).json({ error: '본인의 쿠폰만 사용할 수 있습니다' });
        }
        
        if (userCoupon.status !== 'ISSUED') {
          return res.status(400).json({ error: '이미 사용되었거나 만료된 쿠폰입니다' });
        }
        
        if (userCoupon.validFrom && now < userCoupon.validFrom) {
          return res.status(400).json({ error: '아직 사용할 수 없는 쿠폰입니다' });
        }
        
        if (userCoupon.validTo && now > userCoupon.validTo) {
          return res.status(400).json({ error: '유효기간이 지난 쿠폰입니다' });
        }
        
        const couponDetails = await couponRepository.findCouponById(userCoupon.couponId);
        
        if (!couponDetails || !couponDetails.isActive) {
          return res.status(400).json({ error: '사용할 수 없는 쿠폰입니다' });
        }
        
        if (userCouponIds.length > 1 && !couponDetails.allowMultipleUse) {
          return res.status(400).json({ error: '해당 쿠폰은 다른 쿠폰과 함께 사용할 수 없습니다' });
        }
        
        if (couponDetails.minOrderAmount > totalProductPrice) {
          return res.status(400).json({ 
            error: `최소 주문 금액 ${couponDetails.minOrderAmount.toLocaleString()}원 이상 구매 시 사용 가능합니다` 
          });
        }
        
        if (couponDetails.targetType === 'category') {
          const targetCategoryIds = await couponRepository.getCouponTargetCategories(couponDetails.id);
          const targetExposureCategoryIds = await couponRepository.getCouponTargetExposureCategories(couponDetails.id);
          
          if (targetCategoryIds.length > 0 || targetExposureCategoryIds.length > 0) {
            const targetBrandExposureNames = await getBrandExposureNamesForTargetCategories(targetCategoryIds);
            
            const matches = await checkProductMatchesTargetCategories(
              product.id,
              product.productCategoryId,
              targetCategoryIds,
              targetBrandExposureNames,
              targetExposureCategoryIds
            );
            
            if (!matches) {
              return res.status(400).json({ 
                error: '해당 쿠폰은 지정된 카테고리 상품에만 적용됩니다' 
              });
            }
          }
        }
        
        let thisCouponDiscount = 0;
        if (couponDetails.discountType === 'fixed') {
          thisCouponDiscount = Math.min(couponDetails.discountValue, totalProductPrice - couponDiscountAmount);
        } else if (couponDetails.discountType === 'rate') {
          thisCouponDiscount = Math.floor(totalProductPrice * (couponDetails.discountValue / 100));
          if (couponDetails.maxDiscountAmount && thisCouponDiscount > couponDetails.maxDiscountAmount) {
            thisCouponDiscount = couponDetails.maxDiscountAmount;
          }
        } else if (couponDetails.discountType === 'shipping') {
          if (!shippingDiscountApplied) {
            thisCouponDiscount = shippingAmount;
            shippingDiscountApplied = true;
          }
        }
        
        couponDiscountAmount += thisCouponDiscount;
        appliedUserCouponIds.push(userCoupon.id);
      }
    }
    
    const validatedUsedPoints = Math.max(0, Math.min(usedPoints, totalProductPrice + shippingAmount - couponDiscountAmount));
    const finalAmount = Math.max(0, totalProductPrice + shippingAmount - couponDiscountAmount - validatedUsedPoints);

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
      usedPoints: validatedUsedPoints,
      couponDiscountAmount,
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
      userCouponId: appliedUserCouponIds.length > 0 ? appliedUserCouponIds[0] : null,
      userCouponIdsJson: appliedUserCouponIds.length > 0 ? JSON.stringify(appliedUserCouponIds) : null,
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
      orderPassword,
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

    if (!orderPassword || orderPassword.length < 4 || orderPassword.length > 6) {
      return res.status(400).json({ error: '주문 비밀번호는 4~6자리로 입력해주세요' });
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
        productImageUrl: toAbsoluteImageUrl(item.thumbnailUrl) || null,
        optionName: item.optionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });
      await orderItemRepository.save(orderItem);
    }

    const orderPasswordHash = await bcrypt.hash(orderPassword, 10);
    const guestOrderDetail = guestOrderDetailRepository.create({
      orderId: order.id,
      guestName,
      guestPhoneHash: hashPhone(guestPhone),
      guestPhoneLast4: guestPhone.slice(-4),
      guestEmail: guestEmail || null,
      orderPasswordHash,
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
    const { ordererName, orderNumber, orderPassword } = req.body;

    if (!ordererName || !orderNumber || !orderPassword) {
      return res.status(400).json({ error: '주문자명, 주문번호, 주문 비밀번호를 모두 입력해주세요' });
    }

    const orderRepository = AppDataSource.getRepository(Order);
    const guestOrderDetailRepository = AppDataSource.getRepository(GuestOrderDetail);

    const order = await orderRepository.findOne({
      where: { orderNumber },
      relations: ['items'],
    });

    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    }

    const guestDetail = await guestOrderDetailRepository.findOne({
      where: { orderId: order.id },
    });

    if (!guestDetail) {
      return res.status(404).json({ error: '비회원 주문 정보를 찾을 수 없습니다' });
    }

    if (guestDetail.guestName !== ordererName.trim()) {
      return res.status(401).json({ error: '주문자 정보가 일치하지 않습니다' });
    }

    if (!guestDetail.orderPasswordHash) {
      return res.status(400).json({ error: '비밀번호가 설정되지 않은 주문입니다' });
    }

    const isPasswordValid = await bcrypt.compare(orderPassword, guestDetail.orderPasswordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '주문 비밀번호가 일치하지 않습니다' });
    }

    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalProductPrice: order.totalProductPrice,
      finalAmount: order.finalAmount,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone.slice(0, -4) + '****',
      postalCode: order.postalCode,
      address: order.address,
      addressDetail: order.addressDetail,
      deliveryRequest: order.deliveryRequest,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productImageUrl: toAbsoluteImageUrl(item.productImageUrl),
        optionName: item.optionName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      guestName: guestDetail.guestName,
      guestPhoneLast4: guestDetail.guestPhoneLast4,
      guestEmail: guestDetail.guestEmail,
      isClaimed: !!guestDetail.claimedUserId,
    };

    return res.json({ order: orderData });
  } catch (error) {
    console.error('Failed to lookup guest order:', error);
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
