import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductDetail } from './useProductDetail';
import { useProductReviews } from './useProductReviews';
import { useRelatedProducts } from './useRelatedProducts';
import { useToast } from '../../../contexts/ToastContext';
import type { ProductOption } from '../types/productDetail';
import type { TabType } from '../components/ProductDetailTabs';
import type { SelectedItem } from '../components/OptionBottomSheet';

export function useProductDetailPage(productId: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { product, isLoading, error } = useProductDetail(productId);
  const { reviews, isLoading: reviewsLoading } = useProductReviews(productId);
  const { relatedProducts, isLoading: relatedProductsLoading } = useRelatedProducts(productId);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleOptionSelect = (option: ProductOption) => {
    setSelectedOption(option);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleCartClick = () => {
    console.log('Add to cart:', {
      productId,
      selectedOption,
      quantity,
    });
  };

  const handleBuyClick = useCallback(() => {
    if (product && product.mainOptions && product.mainOptions.length > 0) {
      setIsBottomSheetOpen(true);
    } else {
      console.log('Direct purchase (legacy):', {
        productId,
        selectedOption,
        quantity,
      });
    }
  }, [product, productId, selectedOption, quantity]);

  const handleBottomSheetClose = useCallback(() => {
    setIsBottomSheetOpen(false);
  }, []);

  const handleOptionConfirm = useCallback(async (items: SelectedItem[]) => {
    if (isAddingToCart) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('로그인이 필요합니다', 'error');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    
    try {
      const cartItems = items.map((item) => ({
        mainOptionId: item.mainOption.id,
        subOptionId: item.subOption?.id || null,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          items: cartItems,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast('장바구니에 담았습니다', 'success');
        setIsBottomSheetOpen(false);
        navigate('/cart');
      } else {
        showToast(result.error || '장바구니 추가에 실패했습니다', 'error');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showToast('장바구니 추가에 실패했습니다', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  }, [productId, isAddingToCart, navigate, showToast]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        url: window.location.href,
      });
    }
  };

  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const unitPrice = selectedOption ? selectedOption.price : product.discountedPrice;
    return unitPrice * quantity;
  }, [product, selectedOption, quantity]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleAddToCart = (relatedProductId: string) => {
    console.log('Add related product to cart:', relatedProductId);
  };

  return {
    product,
    isLoading,
    error,
    selectedOption,
    quantity,
    isWishlisted,
    totalPrice,
    activeTab,
    reviews,
    reviewsLoading,
    relatedProducts,
    relatedProductsLoading,
    isBottomSheetOpen,
    handleOptionSelect,
    handleQuantityChange,
    handleWishlistClick,
    handleCartClick,
    handleBuyClick,
    handleShare,
    handleTabChange,
    handleAddToCart,
    handleBottomSheetClose,
    handleOptionConfirm,
  };
}
