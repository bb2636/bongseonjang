import { useState, useMemo } from 'react';
import { useProductDetail } from './useProductDetail';
import type { ProductOption } from '../types/productDetail';

export function useProductDetailPage(productId: string) {
  const { product, isLoading, error } = useProductDetail(productId);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  const handleBuyClick = () => {
    console.log('Buy now:', {
      productId,
      selectedOption,
      quantity,
    });
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

  return {
    product,
    isLoading,
    error,
    selectedOption,
    quantity,
    isWishlisted,
    totalPrice,
    handleOptionSelect,
    handleQuantityChange,
    handleWishlistClick,
    handleCartClick,
    handleBuyClick,
    handleShare,
  };
}
