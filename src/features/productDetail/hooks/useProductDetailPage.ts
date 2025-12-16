import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductDetail } from './useProductDetail';
import { useProductReviews } from './useProductReviews';
import { useRelatedProducts } from './useRelatedProducts';
import { useToast } from '../../../contexts/ToastContext';
import type { ProductOption } from '../types/productDetail';
import type { TabType } from '../components/ProductDetailTabs';
import { useProductInquiries } from './useProductInquiries';

export function useProductDetailPage(productId: string) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { product, isLoading, error } = useProductDetail(productId);
  const { reviews, isLoading: reviewsLoading } = useProductReviews(productId);
  const { relatedProducts, isLoading: relatedProductsLoading } = useRelatedProducts(productId);
  const { inquiries, isLoading: inquiriesLoading } = useProductInquiries(productId);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  useEffect(() => {
    async function checkWishlistStatus() {
      const token = localStorage.getItem('token');
      if (!token || !productId) return;
      
      try {
        const response = await fetch(`/api/wishlist/check/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setIsWishlisted(data.isWishlisted);
        }
      } catch (err) {
        console.error('Failed to check wishlist status:', err);
      }
    }
    checkWishlistStatus();
  }, [productId]);

  const handleOptionSelect = (option: ProductOption) => {
    setSelectedOption(option);
  };

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
  };

  const handleWishlistClick = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showToast('로그인이 필요합니다', 'error');
      navigate('/login');
      return;
    }

    if (isWishlistLoading) return;
    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        const response = await fetch(`/api/wishlist/items/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setIsWishlisted(false);
          showToast('찜 목록에서 삭제되었습니다', 'success');
        } else {
          showToast(result.error || '찜 삭제에 실패했습니다', 'error');
        }
      } else {
        const response = await fetch('/api/wishlist/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setIsWishlisted(result.isWishlisted);
          showToast('찜 목록에 추가되었습니다', 'success');
        } else {
          showToast(result.error || '찜 추가에 실패했습니다', 'error');
        }
      }
    } catch (err) {
      console.error('Failed to toggle wishlist:', err);
      showToast('찜 처리에 실패했습니다', 'error');
    } finally {
      setIsWishlistLoading(false);
    }
  }, [productId, isWishlisted, isWishlistLoading, navigate, showToast]);

  const handleCartClick = () => {
    navigate('/cart');
  };

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
    totalPrice,
    activeTab,
    reviews,
    reviewsLoading,
    inquiries,
    inquiriesLoading,
    relatedProducts,
    relatedProductsLoading,
    isWishlisted,
    handleOptionSelect,
    handleQuantityChange,
    handleCartClick,
    handleShare,
    handleTabChange,
    handleAddToCart,
    handleToggleWishlist: handleWishlistClick,
    handleWriteInquiryClick: () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { from: `/product/${productId}` } });
        return;
      }

      navigate(`/product/${productId}/inquiry/write`, {
        state: {
          product: product
            ? {
                id: product.id,
                name: product.name,
                thumbnailUrl: product.thumbnailUrl,
              }
            : undefined,
        },
      });
    },
  };
}
