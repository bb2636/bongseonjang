import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { useQuery } from '@tanstack/react-query';
import { fetchCart } from '../../cart/api/cartApi';
import { fetchDefaultAddress, fetchAddresses, AddressResponse } from '../../address/api/addressApi';
import { fetchUserProfile } from '../../profile/api/profileApi';
import { preparePayment, prepareDirectPayment, DirectPurchaseItem, fetchMyCoupons, fetchAvailableCoupons, CouponDto, getPaymentResult } from '../api/paymentApi';
import { fetchProductDetail } from '../../productDetail/api/productDetailApi';
import type { ProductDetail } from '../../productDetail/types/productDetail';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { PaymentLoadingOverlay, PaymentStep } from '../../../components';
import { DeliveryRequestBottomSheet } from '../components/DeliveryRequestBottomSheet';
import { AddressSelectBottomSheet } from '../components/AddressSelectBottomSheet';
import { API_BASE_URL, IS_CAPACITOR, CAPACITOR_APP_SCHEME, getAbsoluteApiUrl } from '@/shared/config/apiConfig';
import { InAppBrowser, UrlEvent } from '@capgo/inappbrowser';
import './CheckoutPage.css';

interface DirectPurchaseData {
  productId: string;
  items: DirectPurchaseItem[];
}

interface DisplayItem {
  id: string;
  productName: string;
  productImageUrl: string;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCategoryId?: number | null;
  exposureCategoryIds?: number[];
  couponDiscount?: number;
}

declare global {
  interface Window {
    AUTHNICE: {
      requestPay: (options: {
        clientId: string;
        method: string;
        orderId: string;
        amount: number;
        goodsName: string;
        returnUrl: string;
        vbankHolder?: string;
        fnError: (result: { errorMsg: string }) => void;
      }) => void;
    };
  }
}

const DELIVERY_REQUEST_OPTIONS = [
  '조심히 안전하게 와주세요 :)',
  '문 앞에 두고 가세요',
  '도착 전에 전화주세요',
  '경비실에 맡겨주세요',
  '부재 시 연락 주세요',
  '직접 입력',
];

const DEFAULT_SHIPPING_CONFIG = {
  BASE_FEE: 3500,
  EXTRA_FEE: 3500,
  FREE_THRESHOLD: null as number | null,
};

const REMOTE_AREA_PREFIXES = [
  '63',     // 제주도 전체 (제주시, 서귀포시)
  '402',    // 울릉도 전체 (40200~40250)
  '223',    // 인천 옹진군 (백령도, 대청도, 소청도 등)
  '230',    // 인천 옹진군 도서 (덕적도, 자월도, 영흥도 등)
  '231',    // 인천 옹진군 도서 추가
  '525',    // 여수 거문도, 초도
  '530',    // 신안군 도서 (흑산도, 홍도 등)
  '531',    // 신안군 도서 추가
  '588',    // 통영시 도서 (한산도, 욕지도 등)
  '589',    // 통영시 도서 추가 (사량도 등)
  '590',    // 사천시 도서
  '591',    // 진도군 도서 (조도면 등)
  '597',    // 완도군 도서 (청산도, 보길도 등)
  '598',    // 완도군, 해남군 도서
  '546',    // 고흥군 도서
  '547',    // 고흥군 도서 추가
  '568',    // 보령시 도서 (외연도 등)
  '339',    // 태안군 도서 (안면도 일부)
  '326',    // 서산시 도서
  '336',    // 홍성군 도서
  '540',    // 여수시 도서
  '544',    // 고흥군 내륙 제외 도서
  '579',    // 해남군 도서
  '580',    // 영암군, 강진군 도서
  '582',    // 장흥군 도서
  '169',    // 울진군 도서
  '549',    // 장흥군 도서 추가
  '559',    // 무안군 도서
];

function isRemoteArea(postalCode: string): boolean {
  if (!postalCode) return false;
  const code = postalCode.replace(/-/g, '');
  return REMOTE_AREA_PREFIXES.some(prefix => code.startsWith(prefix));
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const isDirectMode = searchParams.get('direct') === 'true';
  const directDataParam = searchParams.get('data');
  const selectedItemIds = searchParams.get('items')?.split(',') || [];

  const directPurchaseData: DirectPurchaseData | null = useMemo(() => {
    if (!isDirectMode || !directDataParam) return null;
    try {
      return JSON.parse(decodeURIComponent(directDataParam));
    } catch {
      return null;
    }
  }, [isDirectMode, directDataParam]);

  const [deliveryRequest, setDeliveryRequest] = useState('');
  const [customDeliveryRequest, setCustomDeliveryRequest] = useState('');
  const [isDeliverySheetOpen, setIsDeliverySheetOpen] = useState(false);
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    return sessionStorage.getItem('checkout_selected_address_id');
  });
  const [isProductsExpanded, setIsProductsExpanded] = useState(true);
  const [pointInput, setPointInput] = useState('');
  const [usedPoints, setUsedPoints] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('preparing');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'vbank'>('card');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [selectedCouponIds, setSelectedCouponIds] = useState<number[]>([]);
  const [isCouponDropdownOpen, setIsCouponDropdownOpen] = useState(false);
  const couponDropdownRef = useRef<HTMLDivElement>(null);

  const { data: cart, isLoading: isCartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 1000 * 60 * 5,
    enabled: !isDirectMode,
  });

  const { data: directProduct, isLoading: isDirectProductLoading } = useQuery({
    queryKey: ['directProduct', directPurchaseData?.productId],
    queryFn: () => fetchProductDetail(directPurchaseData!.productId),
    staleTime: 1000 * 60 * 5,
    enabled: isDirectMode && !!directPurchaseData?.productId,
  });

  const { data: defaultAddress, isLoading: isAddressLoading } = useQuery({
    queryKey: ['defaultAddress'],
    queryFn: fetchDefaultAddress,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: addresses = [], isLoading: isAddressesLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const productIds = useMemo(() => {
    if (isDirectMode && directPurchaseData) {
      return [directPurchaseData.productId];
    }
    const cartSelectedItems = cart?.items.filter(item => selectedItemIds.includes(item.id)) || [];
    return [...new Set(cartSelectedItems.map(item => item.productId))];
  }, [isDirectMode, directPurchaseData, cart, selectedItemIds]);

  const { data: myCoupons = [] } = useQuery({
    queryKey: ['availableCoupons', productIds],
    queryFn: () => fetchAvailableCoupons(productIds),
    enabled: !!user && productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isDirectMode 
    ? (isDirectProductLoading || isAddressLoading || isAddressesLoading || isProfileLoading)
    : (isCartLoading || isAddressLoading || isAddressesLoading || isProfileLoading);

  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      const savedAddress = addresses.find(addr => addr.id === selectedAddressId);
      if (savedAddress) {
        setSelectedAddress(savedAddress);
        return;
      } else {
        sessionStorage.removeItem('checkout_selected_address_id');
        setSelectedAddressId(null);
      }
    }
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress, addresses, selectedAddressId]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem('checkout_selected_address_id');
    };
  }, []);

  const currentAddress = selectedAddress || defaultAddress;

  const { displayItems, shippingConfig } = useMemo(() => {
    let items: DisplayItem[] = [];
    let config = {
      shippingFee: DEFAULT_SHIPPING_CONFIG.BASE_FEE,
      freeShippingThreshold: DEFAULT_SHIPPING_CONFIG.FREE_THRESHOLD,
    };
    
    if (isDirectMode && directProduct && directPurchaseData) {
      config.shippingFee = directProduct.shippingFee ?? DEFAULT_SHIPPING_CONFIG.BASE_FEE;
      config.freeShippingThreshold = directProduct.freeShippingThreshold ?? null;
      
      items = directPurchaseData.items.map((item, index) => {
        const productOption = item.productOptionId 
          ? directProduct.options.find(opt => opt.id === item.productOptionId) ||
            directProduct.mainOptions.find(opt => opt.id === item.productOptionId)
          : null;
        
        const unitPrice = productOption 
          ? directProduct.discountedPrice + (productOption.additionalPrice ?? 0)
          : directProduct.discountedPrice;
        
        return {
          id: `direct-${index}`,
          productName: directProduct.name,
          productImageUrl: directProduct.thumbnailUrl || '',
          optionName: productOption?.name || null,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          productCategoryId: directProduct.productCategoryId,
          exposureCategoryIds: directProduct.exposureCategoryIds || [],
        };
      });
    } else {
      const cartSelectedItems = cart?.items.filter(item => selectedItemIds.includes(item.id)) || [];
      
      if (cartSelectedItems.length > 0) {
        const firstItem = cartSelectedItems[0];
        config.shippingFee = (firstItem as { shippingFee?: number }).shippingFee ?? DEFAULT_SHIPPING_CONFIG.BASE_FEE;
        config.freeShippingThreshold = (firstItem as { freeShippingThreshold?: number | null }).freeShippingThreshold ?? null;
      }
      
      items = cartSelectedItems.map(item => ({
        id: item.id,
        productName: item.productName,
        productImageUrl: item.productImageUrl,
        optionName: item.productOptionName || null,
        quantity: item.quantity,
        unitPrice: item.totalPrice / item.quantity,
        totalPrice: item.totalPrice,
        productCategoryId: (item as { productCategoryId?: number | null }).productCategoryId,
        exposureCategoryIds: (item as { exposureCategoryIds?: number[] }).exposureCategoryIds || [],
      }));
    }
    
    return { displayItems: items, shippingConfig: config };
  }, [isDirectMode, directProduct, directPurchaseData, cart, selectedItemIds]);

  const productAmount = displayItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const availablePoints = userProfile?.points ?? 0;
  const couponCount = myCoupons.length;
  
  const usableCoupons = useMemo(() => {
    return myCoupons.filter(coupon => productAmount >= coupon.minOrderAmount);
  }, [myCoupons, productAmount]);

  const selectedCoupons = useMemo(() => {
    return myCoupons.filter(c => selectedCouponIds.includes(c.id));
  }, [myCoupons, selectedCouponIds]);

  const hasInvalidMultipleCouponSelection = useMemo(() => {
    if (selectedCoupons.length <= 1) return false;
    return selectedCoupons.some(c => !c.allowMultipleUse);
  }, [selectedCoupons]);

  const baseShippingFee = useMemo(() => {
    const freeThreshold = shippingConfig.freeShippingThreshold;
    if (freeThreshold !== null && productAmount >= freeThreshold) return 0;
    const baseFee = shippingConfig.shippingFee;
    const extraFee = currentAddress && isRemoteArea(currentAddress.postalCode) ? DEFAULT_SHIPPING_CONFIG.EXTRA_FEE : 0;
    return baseFee + extraFee;
  }, [productAmount, currentAddress, shippingConfig]);

  const { couponDiscount, itemDiscounts } = useMemo(() => {
    const discountMap = new Map<string, number>();
    
    if (selectedCoupons.length === 0 || hasInvalidMultipleCouponSelection) {
      return { couponDiscount: 0, itemDiscounts: discountMap };
    }
    
    let totalDiscount = 0;
    
    for (const coupon of selectedCoupons) {
      if (productAmount < coupon.minOrderAmount) continue;
      if (coupon.discountType === 'shipping') continue;
      
      let applicableItems = displayItems;
      
      if (coupon.targetType === 'category') {
        const targetCategoryIds = coupon.targetCategoryIds || [];
        const targetExposureCategoryIds = coupon.targetExposureCategoryIds || [];
        
        if (targetCategoryIds.length > 0 || targetExposureCategoryIds.length > 0) {
          applicableItems = displayItems.filter(item => {
            if (targetCategoryIds.length > 0 && item.productCategoryId) {
              if (targetCategoryIds.includes(item.productCategoryId)) {
                return true;
              }
            }
            if (targetExposureCategoryIds.length > 0 && item.exposureCategoryIds) {
              if (item.exposureCategoryIds.some(id => targetExposureCategoryIds.includes(id))) {
                return true;
              }
            }
            return false;
          });
        }
      }
      
      if (applicableItems.length === 0) continue;
      
      const highestItem = applicableItems.reduce((max, item) => 
        item.totalPrice > max.totalPrice ? item : max, applicableItems[0]);
      
      const applicableSubtotal = highestItem.totalPrice;
      
      let discount = 0;
      if (coupon.discountType === 'fixed') {
        discount = Math.min(coupon.discountValue, applicableSubtotal);
      } else if (coupon.discountType === 'rate') {
        discount = Math.floor(applicableSubtotal * coupon.discountValue / 100);
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
          discount = coupon.maxDiscountAmount;
        }
      }
      
      const existingDiscount = discountMap.get(highestItem.id) || 0;
      discountMap.set(highestItem.id, existingDiscount + discount);
      
      totalDiscount += discount;
    }
    
    return { couponDiscount: Math.min(totalDiscount, productAmount), itemDiscounts: discountMap };
  }, [selectedCoupons, productAmount, hasInvalidMultipleCouponSelection, displayItems]);

  const shippingCouponDiscount = useMemo(() => {
    if (selectedCoupons.length === 0) return 0;
    if (hasInvalidMultipleCouponSelection) return 0;
    if (baseShippingFee === 0) return 0;
    
    let totalShippingDiscount = 0;
    for (const coupon of selectedCoupons) {
      if (coupon.discountType !== 'shipping') continue;
      if (productAmount < coupon.minOrderAmount) continue;
      
      if (coupon.discountValue === 0) {
        totalShippingDiscount += baseShippingFee;
      } else {
        totalShippingDiscount += coupon.discountValue;
      }
    }
    return Math.min(totalShippingDiscount, baseShippingFee);
  }, [selectedCoupons, productAmount, baseShippingFee, hasInvalidMultipleCouponSelection]);
  
  const shippingFee = baseShippingFee - shippingCouponDiscount;
  
  const finalAmount = productAmount + shippingFee - usedPoints - couponDiscount;

  useEffect(() => {
    if (isDirectMode) {
      if (!isLoading && !directPurchaseData) {
        showToast('상품 정보가 올바르지 않습니다', 'error');
        navigate('/');
      }
    } else {
      if (!isLoading && selectedItemIds.length === 0) {
        showToast('결제할 상품을 선택해주세요', 'error');
        navigate('/cart');
      }
    }
  }, [isLoading, isDirectMode, directPurchaseData, selectedItemIds, navigate, showToast]);

  const handleDeliveryRequestChange = (value: string) => {
    setDeliveryRequest(value);
    if (value !== '직접 입력') {
      setCustomDeliveryRequest('');
    }
  };

  const handlePointInputChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setPointInput(numericValue);
  };

  const handleUseAllPoints = () => {
    const maxUsable = Math.min(availablePoints, productAmount);
    setPointInput(maxUsable.toString());
    setUsedPoints(maxUsable);
  };

  const handleApplyPoints = () => {
    const points = parseInt(pointInput) || 0;
    const maxUsable = Math.min(points, availablePoints, productAmount);
    setUsedPoints(maxUsable);
    setPointInput(maxUsable.toString());
  };

  const handleCouponSelect = (couponId: number) => {
    const coupon = myCoupons.find(c => c.id === couponId);
    if (!coupon) return;
    
    setSelectedCouponIds(prev => {
      if (prev.includes(couponId)) {
        return prev;
      }
      
      if (!coupon.allowMultipleUse) {
        return [couponId];
      }
      
      const hasNonStackableSelected = prev.some(id => {
        const selectedCoupon = myCoupons.find(c => c.id === id);
        return selectedCoupon && !selectedCoupon.allowMultipleUse;
      });
      
      if (hasNonStackableSelected) {
        return [couponId];
      }
      
      return [...prev, couponId];
    });
    setIsCouponDropdownOpen(false);
  };

  const handleCouponRemove = (couponId: number) => {
    setSelectedCouponIds(prev => prev.filter(id => id !== couponId));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (couponDropdownRef.current && !couponDropdownRef.current.contains(event.target as Node)) {
        setIsCouponDropdownOpen(false);
      }
    };
    
    if (isCouponDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCouponDropdownOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentAddress) {
      showToast('배송지를 등록해주세요', 'error');
      return;
    }

    if (displayItems.length === 0) {
      showToast('결제할 상품이 없습니다', 'error');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('preparing');

    const finalDeliveryRequest = deliveryRequest === '직접 입력' 
      ? customDeliveryRequest 
      : deliveryRequest === '배송 메세지를 선택해주세요' 
        ? '' 
        : deliveryRequest;

    try {
      let paymentData;
      
      if (isDirectMode && directPurchaseData) {
        paymentData = await prepareDirectPayment({
          productId: directPurchaseData.productId,
          items: directPurchaseData.items,
          recipientName: currentAddress.recipientName,
          recipientPhone: currentAddress.recipientPhone,
          postalCode: currentAddress.postalCode,
          address: currentAddress.address,
          addressDetail: currentAddress.addressDetail,
          deliveryRequest: finalDeliveryRequest,
          paymentMethod,
          shippingFee,
          userCouponIds: selectedCouponIds.length > 0 ? selectedCouponIds : undefined,
          usedPoints: usedPoints > 0 ? usedPoints : undefined,
        });
      } else {
        paymentData = await preparePayment({
          selectedItemIds,
          recipientName: currentAddress.recipientName,
          recipientPhone: currentAddress.recipientPhone,
          postalCode: currentAddress.postalCode,
          address: currentAddress.address,
          addressDetail: currentAddress.addressDetail,
          deliveryRequest: finalDeliveryRequest,
          paymentMethod,
          shippingFee,
          userCouponIds: selectedCouponIds.length > 0 ? selectedCouponIds : undefined,
          usedPoints: usedPoints > 0 ? usedPoints : undefined,
        });
      }

      setPaymentStep('connecting');

      if (IS_CAPACITOR) {
        const absoluteApiUrl = getAbsoluteApiUrl();
        const paymentFormUrl = `${absoluteApiUrl}/payment/form/${paymentData.orderId}?appScheme=${CAPACITOR_APP_SCHEME}`;
        
        let browserClosed = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        
        const handleUrlChange = async (event: UrlEvent) => {
          const url = event.url;
          console.log('[Payment] URL changed:', url);
          
          const isPaymentCallback = 
            url.includes('/payment/success') || 
            url.includes('/payment/fail') || 
            url.includes('/payment/complete') ||
            url.startsWith(`${CAPACITOR_APP_SCHEME}://`);
          
          if (isPaymentCallback) {
            browserClosed = true;
            
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            await InAppBrowser.removeAllListeners();
            await InAppBrowser.close();
            
            try {
              const urlObj = new URL(url.replace(`${CAPACITOR_APP_SCHEME}://`, 'https://app/'));
              
              const completeMatch = url.match(/\/payment\/complete\/([a-zA-Z0-9-]+)/);
              if (completeMatch) {
                const orderId = completeMatch[1];
                navigate(`/payment/complete/${orderId}`);
                return;
              }
              
              const orderId = urlObj.searchParams.get('orderId') || paymentData.orderId;
              
              if (url.includes('/payment/success') || url.includes('payment-success')) {
                navigate(`/payment/success?orderId=${orderId}`);
              } else if (url.includes('/payment/fail') || url.includes('payment-fail')) {
                const message = urlObj.searchParams.get('message') || '결제에 실패했습니다';
                navigate(`/payment/fail?message=${encodeURIComponent(message)}`);
              } else {
                navigate(`/payment/complete/${paymentData.orderId}`);
              }
            } catch {
              navigate(`/payment/complete/${paymentData.orderId}`);
            }
          }
        };
        
        const handleClose = async () => {
          console.log('[Payment] InAppBrowser closed');
          
          if (!browserClosed) {
            browserClosed = true;
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            await InAppBrowser.removeAllListeners();
            
            try {
              console.log('[Payment] Checking order status after browser close...');
              const result = await getPaymentResult(paymentData.orderId);
              console.log('[Payment] Order status result:', result);
              
              if (result.success && result.order) {
                const orderStatus = result.order.status;
                if (orderStatus === 'paid' || orderStatus === 'shipping' || orderStatus === 'delivered') {
                  console.log('[Payment] Order was paid, navigating to complete page');
                  navigate(`/payment/complete/${paymentData.orderId}`);
                  return;
                }
              }
              
              console.log('[Payment] Order not paid, deleting pending order...');
              await fetch(`${API_BASE_URL}/payment/log-error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: paymentData.orderId,
                  method: paymentMethod,
                  errorCode: 'USER_CANCELLED',
                  errorMsg: '사용자가 결제를 취소했습니다',
                  deleteOrder: true,
                  deletionToken: paymentData.deletionToken,
                }),
              });
              console.log('[Payment] Pending order deletion requested');
            } catch (err) {
              console.error('[Payment] Failed to check order status:', err);
            }
            
            setIsProcessing(false);
          }
        };
        
        await InAppBrowser.addListener('urlChangeEvent', handleUrlChange);
        await InAppBrowser.addListener('closeEvent', handleClose);
        
        timeoutId = setTimeout(async () => {
          if (!browserClosed) {
            console.log('[Payment] Timeout reached, checking order status...');
            browserClosed = true;
            await InAppBrowser.removeAllListeners();
            await InAppBrowser.close().catch(() => {});
            
            try {
              const result = await getPaymentResult(paymentData.orderId);
              if (result.success && result.order) {
                const orderStatus = result.order.status;
                if (orderStatus === 'paid' || orderStatus === 'shipping' || orderStatus === 'delivered') {
                  console.log('[Payment] Order was actually paid, navigating to complete');
                  navigate(`/payment/complete/${paymentData.orderId}`);
                  return;
                }
              }
              
              console.log('[Payment] Timeout - deleting pending order...');
              await fetch(`${API_BASE_URL}/payment/log-error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: paymentData.orderId,
                  method: paymentMethod,
                  errorCode: 'TIMEOUT',
                  errorMsg: '결제 시간이 초과되었습니다',
                  deleteOrder: true,
                  deletionToken: paymentData.deletionToken,
                }),
              });
            } catch (err) {
              console.error('[Payment] Failed to check order status on timeout:', err);
            }
            
            setIsProcessing(false);
            showToast('결제 시간이 초과되었습니다', 'error');
          }
        }, 10 * 60 * 1000);
        
        try {
          await InAppBrowser.openWebView({ 
            url: paymentFormUrl, 
            title: '결제',
            isPresentAfterPageLoad: true,
            activeNativeNavigationForWebview: true,
          });
          console.log('[Payment] InAppBrowser opened');
        } catch (err) {
          console.error('[Payment] Failed to open InAppBrowser:', err);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          await InAppBrowser.removeAllListeners();
          setIsProcessing(false);
          showToast('결제창을 열 수 없습니다', 'error');
        }
        
        return;
      }

      if (!window.AUTHNICE) {
        showToast('결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', 'error');
        setIsProcessing(false);
        return;
      }

      setPaymentStep('waiting');

      const currentOrderId = paymentData.orderId;
      
      window.AUTHNICE.requestPay({
        clientId: paymentData.clientKey,
        method: paymentMethod,
        orderId: currentOrderId,
        amount: paymentData.amount,
        goodsName: paymentData.goodsName,
        returnUrl: paymentData.returnUrl,
        ...(paymentMethod === 'vbank' && { vbankHolder: currentAddress.recipientName }),
        fnError: async (result) => {
          console.error('[Payment] fnError:', result);
          showToast(`결제 오류: ${result.errorMsg}`, 'error');
          setIsProcessing(false);
          
          if (currentOrderId) {
            try {
              await fetch(`${API_BASE_URL}/payment/log-error`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: currentOrderId,
                  method: paymentMethod,
                  errorCode: result.errorCode,
                  errorMsg: result.errorMsg,
                  fullResult: result,
                  deleteOrder: true,
                  deletionToken: paymentData.deletionToken,
                }),
              });
              console.log('[Payment] Pending order deletion requested');
            } catch (err) {
              console.error('[Payment] Failed to delete pending order:', err);
            }
          }
        },
      });
    } catch (error) {
      console.error('Payment preparation failed:', error);
      const errorMessage = error instanceof Error ? error.message : '결제 준비 중 오류가 발생했습니다';
      showToast(errorMessage, 'error');
      setIsProcessing(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (isLoading) {
    return (
      <div className="checkout-page">
        <div className="checkout-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {isProcessing && <PaymentLoadingOverlay step={paymentStep} />}
      <header className="checkout-header">
        <button type="button" className="checkout-back-button" onClick={goBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="checkout-title">주문/결제</h1>
        <div style={{ width: 24 }} />
      </header>
      <div className="checkout-header-spacer" />

      <form className="checkout-form" onSubmit={handleSubmit} noValidate>
        <section className="checkout-address-card">
          {currentAddress ? (
            <>
              <div className="checkout-address-header">
                <div className="checkout-address-name-row">
                  <span className="checkout-address-name">{currentAddress.addressName}</span>
                  {currentAddress.isDefault && (
                    <span className="checkout-address-default-label">기본배송지</span>
                  )}
                </div>
                <button 
                  type="button" 
                  className="checkout-address-change-button"
                  onClick={() => setIsAddressSheetOpen(true)}
                >
                  변경
                </button>
              </div>
              <div className="checkout-address-details">
                <p className="checkout-address-detail-text">{currentAddress.recipientName}</p>
                <p className="checkout-address-detail-text">
                  ({currentAddress.postalCode}) {currentAddress.address} {currentAddress.addressDetail}
                </p>
                <p className="checkout-address-detail-text">
                  {formatPhoneNumber(currentAddress.recipientPhone)}
                </p>
              </div>
            </>
          ) : (
            <div className="checkout-no-address">
              <p>등록된 배송지가 없습니다</p>
              <button 
                type="button" 
                className="checkout-add-address-button"
                onClick={() => navigate('/address/add')}
              >
                배송지 등록
              </button>
            </div>
          )}
        </section>

        <div className="checkout-divider" />

        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">배송 요청사항</h2>
          </div>
          <div className="checkout-delivery-request">
            <button
              type="button"
              className="checkout-delivery-select-button"
              onClick={() => setIsDeliverySheetOpen(true)}
            >
              <span className={deliveryRequest ? 'checkout-delivery-select-text--selected' : 'checkout-delivery-select-text'}>
                {deliveryRequest || '배송 메세지를 선택해주세요'}
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {deliveryRequest === '직접 입력' && (
              <input
                type="text"
                className="checkout-input"
                value={customDeliveryRequest}
                onChange={(e) => setCustomDeliveryRequest(e.target.value)}
                placeholder="배송 요청사항을 입력해주세요"
              />
            )}
          </div>
        </section>

        <section className="checkout-section">
          <div 
            className="checkout-section-header checkout-section-header--clickable"
            onClick={() => setIsProductsExpanded(!isProductsExpanded)}
          >
            <h2 className="checkout-section-title">
              주문상품 <span className="checkout-section-count">{displayItems.length.toString().padStart(2, '0')}</span>
            </h2>
            <svg 
              className={`checkout-expand-icon ${isProductsExpanded ? 'checkout-expand-icon--expanded' : ''}`}
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {isProductsExpanded && (
            <div className="checkout-items">
              {displayItems.map(item => {
                const itemDiscount = itemDiscounts.get(item.id) || 0;
                return (
                  <div key={item.id} className="checkout-item">
                    <img src={item.productImageUrl} alt={item.productName} className="checkout-item-image" />
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.productName}</p>
                      {item.optionName && (
                        <p className="checkout-item-option">{item.optionName}</p>
                      )}
                      <p className="checkout-item-quantity">수량 : {item.quantity}개</p>
                      <div className="checkout-item-price-row">
                        <p className={`checkout-item-price ${itemDiscount > 0 ? 'checkout-item-price--original' : ''}`}>
                          {item.totalPrice.toLocaleString()}원
                        </p>
                        {itemDiscount > 0 && (
                          <p className="checkout-item-discount">-{itemDiscount.toLocaleString()}원</p>
                        )}
                      </div>
                      {itemDiscount > 0 && (
                        <p className="checkout-item-final-price">
                          {(item.totalPrice - itemDiscount).toLocaleString()}원
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="checkout-section">
          <div 
            className="checkout-section-header checkout-section-header--clickable"
          >
            <h2 className="checkout-section-title">포인트 할인</h2>
            <svg 
              className="checkout-expand-icon checkout-expand-icon--expanded"
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="checkout-point-section">
            <div className="checkout-point-input-row">
              <div className="checkout-point-input-wrapper">
                <input
                  type="text"
                  className="checkout-point-input"
                  value={pointInput}
                  onChange={(e) => handlePointInputChange(e.target.value)}
                  onBlur={handleApplyPoints}
                  placeholder="0"
                />
                {pointInput && (
                  <button 
                    type="button" 
                    className="checkout-point-clear"
                    onClick={() => { setPointInput(''); setUsedPoints(0); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="rgba(0,0,0,0.3)"/>
                      <path d="M8 8L16 16M16 8L8 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
              <button 
                type="button" 
                className="checkout-point-all-button"
                onClick={handleUseAllPoints}
              >
                전액 사용
              </button>
            </div>
            <p className="checkout-point-available">
              사용 가능 포인트 <span className="checkout-point-value">{availablePoints.toLocaleString()}p</span>
            </p>
          </div>
        </section>

        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">쿠폰 할인</h2>
          </div>
          <div className="checkout-coupon-section">
            {selectedCoupons.length > 0 && (
              <div className="checkout-coupon-tags">
                {selectedCoupons.map(coupon => (
                  <div key={coupon.id} className="checkout-coupon-tag">
                    <span className="checkout-coupon-tag__text">
                      {coupon.name}
                      {coupon.discountType === 'shipping' 
                        ? ' (배송비 쿠폰)'
                        : coupon.discountType === 'fixed'
                          ? ` (-${coupon.discountValue.toLocaleString()}원)`
                          : ` (-${coupon.discountValue}%)`}
                    </span>
                    <button 
                      type="button" 
                      className="checkout-coupon-tag__remove"
                      onClick={() => handleCouponRemove(coupon.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {usableCoupons.length === 0 ? (
              <p className="checkout-coupon-empty">적용할 수 있는 쿠폰이 없습니다</p>
            ) : (
              <div className="checkout-coupon-select" ref={couponDropdownRef}>
                <button
                  type="button"
                  className="checkout-coupon-select__trigger"
                  onClick={() => setIsCouponDropdownOpen(!isCouponDropdownOpen)}
                >
                  <span className="checkout-coupon-select__placeholder">
                    {selectedCoupons.length > 0 
                      ? `${selectedCoupons.length}개 쿠폰 적용됨` 
                      : '쿠폰을 선택해주세요'}
                  </span>
                  <svg 
                    className={`checkout-coupon-select__arrow ${isCouponDropdownOpen ? 'checkout-coupon-select__arrow--open' : ''}`}
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {isCouponDropdownOpen && (
                  <div className="checkout-coupon-select__dropdown">
                    {usableCoupons.map(coupon => {
                      const isSelected = selectedCouponIds.includes(coupon.id);
                      const hasNonStackableSelected = selectedCoupons.some(c => !c.allowMultipleUse);
                      const isDisabled = !isSelected && hasNonStackableSelected;
                      
                      return (
                        <button
                          key={coupon.id}
                          type="button"
                          className={`checkout-coupon-select__option ${isSelected ? 'checkout-coupon-select__option--selected' : ''} ${isDisabled ? 'checkout-coupon-select__option--disabled' : ''}`}
                          onClick={() => !isDisabled && !isSelected && handleCouponSelect(coupon.id)}
                          disabled={isDisabled}
                        >
                          <div className="checkout-coupon-select__option-info">
                            <span className="checkout-coupon-select__option-name">
                              {coupon.name}
                              {!coupon.allowMultipleUse && (
                                <span className="checkout-coupon-select__badge">(중복 불가)</span>
                              )}
                            </span>
                            <span className="checkout-coupon-select__option-discount">
                              {coupon.discountType === 'shipping' 
                                ? '배송비 쿠폰'
                                : coupon.discountType === 'fixed'
                                  ? `${coupon.discountValue.toLocaleString()}원 할인`
                                  : `${coupon.discountValue}% 할인${coupon.maxDiscountAmount ? ` (최대 ${coupon.maxDiscountAmount.toLocaleString()}원)` : ''}`}
                            </span>
                          </div>
                          {isSelected && (
                            <svg className="checkout-coupon-select__check" width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            
            {hasInvalidMultipleCouponSelection && (
              <p className="checkout-coupon-warning">
                중복 사용이 불가능한 쿠폰이 포함되어 있습니다
              </p>
            )}
            <p className="checkout-coupon-available">
              보유쿠폰 <span className="checkout-coupon-value">{couponCount}장</span>
            </p>
          </div>
        </section>

        <section className="checkout-section checkout-section--summary">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">최종 결제금액</h2>
          </div>
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">총 상품금액</span>
              <span className="checkout-summary-value">{productAmount.toLocaleString()}원</span>
            </div>
            <div className="checkout-summary-row">
              <span className="checkout-summary-label">
                배송비
                {currentAddress && isRemoteArea(currentAddress.postalCode) && (
                  <span className="checkout-summary-label-sub"> (제주/도서산간)</span>
                )}
              </span>
              <span className="checkout-summary-value">
                {baseShippingFee === 0 ? '무료' : `+${baseShippingFee.toLocaleString()}원`}
              </span>
            </div>
            {shippingConfig.freeShippingThreshold !== null && productAmount < shippingConfig.freeShippingThreshold && (
              <p className="checkout-free-shipping-notice">
                {(shippingConfig.freeShippingThreshold - productAmount).toLocaleString()}원 더 담으면 무료배송!
              </p>
            )}
            {usedPoints > 0 && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">포인트 할인</span>
                <span className="checkout-summary-value checkout-summary-value--discount">-{usedPoints.toLocaleString()}원</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">쿠폰 할인</span>
                <span className="checkout-summary-value checkout-summary-value--discount">-{couponDiscount.toLocaleString()}원</span>
              </div>
            )}
            {shippingCouponDiscount > 0 && (
              <div className="checkout-summary-row">
                <span className="checkout-summary-label">배송비 쿠폰 할인</span>
                <span className="checkout-summary-value checkout-summary-value--discount">-{shippingCouponDiscount.toLocaleString()}원</span>
              </div>
            )}
          </div>
          <div className="checkout-final-amount">
            <span className="checkout-final-amount-value">{finalAmount.toLocaleString()}원</span>
          </div>
        </section>

        <section className="checkout-section">
          <div className="checkout-section-header">
            <h2 className="checkout-section-title">결제수단</h2>
          </div>
          <div className="checkout-payment-methods">
            <label className="checkout-payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              />
              <span className="checkout-payment-method-radio"></span>
              <span className="checkout-payment-method-label">카드</span>
            </label>
            <label className="checkout-payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              />
              <span className="checkout-payment-method-radio"></span>
              <span className="checkout-payment-method-label">계좌이체</span>
            </label>
            <label className="checkout-payment-method">
              <input
                type="radio"
                name="paymentMethod"
                value="vbank"
                checked={paymentMethod === 'vbank'}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              />
              <span className="checkout-payment-method-radio"></span>
              <span className="checkout-payment-method-label">무통장입금</span>
            </label>
          </div>
        </section>

        <section className="checkout-section checkout-section--terms">
          <label className="checkout-terms-checkbox">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
            />
            <span className="checkout-terms-checkmark"></span>
            <span className="checkout-terms-text">주문 내용을 확인하였으며, 결제에 동의합니다</span>
          </label>
        </section>

        <div className="checkout-submit-container">
          <button
            type="submit"
            className="checkout-submit-button"
            disabled={isProcessing || !currentAddress || !termsAgreed || hasInvalidMultipleCouponSelection}
          >
            {isProcessing ? '처리 중...' : `${finalAmount.toLocaleString()}원 결제하기`}
          </button>
        </div>
      </form>

      <DeliveryRequestBottomSheet
        isOpen={isDeliverySheetOpen}
        onClose={() => setIsDeliverySheetOpen(false)}
        options={DELIVERY_REQUEST_OPTIONS}
        selectedOption={deliveryRequest}
        onSelect={handleDeliveryRequestChange}
      />

      <AddressSelectBottomSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        addresses={addresses}
        selectedAddressId={currentAddress?.id || null}
        onSelect={(address) => {
          setSelectedAddress(address);
          setSelectedAddressId(address.id);
          sessionStorage.setItem('checkout_selected_address_id', address.id);
        }}
        onEdit={(address) => navigate(`/address/edit/${address.id}`)}
        onAddNew={() => navigate('/address/add')}
      />
    </div>
  );
}
