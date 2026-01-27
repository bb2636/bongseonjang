import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { API_BASE_URL } from '../shared/config/apiConfig';

interface QuickCartProduct {
  id: string;
  name: string;
  basePrice: number;
  discountedPrice: number;
  imageUrl?: string;
  isOptionRequired: boolean;
  stockQuantity: number;
  saleStartAt?: string;
  saleEndAt?: string;
  options: QuickCartOption[];
  mainOptions: QuickCartOption[];
}

interface QuickCartOption {
  id: string;
  groupName: string;
  name: string;
  additionalPrice: number;
  stockQty: number;
}

interface QuickCartContextType {
  isOpen: boolean;
  product: QuickCartProduct | null;
  isLoading: boolean;
  error: string | null;
  openQuickCart: (productId: string) => Promise<void>;
  closeQuickCart: () => void;
}

const QuickCartContext = createContext<QuickCartContextType | undefined>(undefined);

interface QuickCartProviderProps {
  children: ReactNode;
}

export function QuickCartProvider({ children }: QuickCartProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<QuickCartProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openQuickCart = useCallback(async (productId: string) => {
    if (!productId) {
      console.error('QuickCart: productId is undefined or empty');
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setError(null);
    setProduct(null);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      if (!response.ok) {
        throw new Error('상품 정보를 불러올 수 없습니다');
      }

      const data = await response.json();
      
      if (!data || !data.id) {
        throw new Error('상품 정보가 올바르지 않습니다');
      }
      
      const basePrice = data.basePrice ?? 0;
      const discountedPrice = data.isDiscounted
        ? Math.round(basePrice * (1 - (data.discountRate || 0) / 100))
        : basePrice;

      const quickCartProduct: QuickCartProduct = {
        id: data.id,
        name: data.name,
        basePrice,
        discountedPrice,
        imageUrl: data.images?.[0]?.imageUrl,
        isOptionRequired: data.isOptionRequired,
        stockQuantity: data.stockQuantity ?? 0,
        saleStartAt: data.saleStartAt,
        saleEndAt: data.saleEndAt,
        options: (data.options || []).map((opt: any) => ({
          id: opt.id,
          groupName: '옵션 선택',
          name: opt.name,
          additionalPrice: opt.additionalPrice ?? 0,
          stockQty: opt.stockQty,
        })),
        mainOptions: (data.mainOptions || []).map((opt: any) => ({
          id: opt.id,
          groupName: opt.groupName || '옵션 선택',
          name: opt.name,
          additionalPrice: opt.additionalPrice ?? 0,
          stockQty: opt.stockQty,
        })),
      };

      setProduct(quickCartProduct);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '상품 정보를 불러올 수 없습니다';
      console.error('Failed to open quick cart:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeQuickCart = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
    setError(null);
  }, []);

  const value: QuickCartContextType = {
    isOpen,
    product,
    isLoading,
    error,
    openQuickCart,
    closeQuickCart,
  };

  return (
    <QuickCartContext.Provider value={value}>
      {children}
    </QuickCartContext.Provider>
  );
}

export function useQuickCart(): QuickCartContextType {
  const context = useContext(QuickCartContext);

  if (context === undefined) {
    throw new Error('useQuickCart must be used within a QuickCartProvider');
  }

  return context;
}

export type { QuickCartProduct, QuickCartOption };
