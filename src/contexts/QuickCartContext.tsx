import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface QuickCartProduct {
  id: string;
  name: string;
  basePrice: number;
  discountedPrice: number;
  imageUrl?: string;
  isOptionRequired: boolean;
  mainOptions: QuickCartOption[];
}

interface QuickCartOption {
  id: string;
  groupName: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stockQty: number;
}

interface QuickCartContextType {
  isOpen: boolean;
  product: QuickCartProduct | null;
  isLoading: boolean;
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

  const openQuickCart = useCallback(async (productId: string) => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      
      const discountedPrice = data.isDiscounted
        ? Math.round(data.basePrice * (1 - (data.discountRate || 0) / 100))
        : data.basePrice;

      const quickCartProduct: QuickCartProduct = {
        id: data.id,
        name: data.name,
        basePrice: data.basePrice,
        discountedPrice,
        imageUrl: data.images?.[0]?.imageUrl,
        isOptionRequired: data.isOptionRequired,
        mainOptions: (data.mainOptions || []).map((opt: any) => ({
          id: opt.id,
          groupName: opt.groupName || '옵션 선택',
          name: opt.name,
          price: opt.price,
          compareAtPrice: opt.compareAtPrice,
          stockQty: opt.stockQty,
        })),
      };

      setProduct(quickCartProduct);
    } catch (error) {
      console.error('Failed to open quick cart:', error);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeQuickCart = useCallback(() => {
    setIsOpen(false);
    setProduct(null);
  }, []);

  const value: QuickCartContextType = {
    isOpen,
    product,
    isLoading,
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
