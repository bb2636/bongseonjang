import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  incrementCart: () => void;
  decrementCart: () => void;
  setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartCount, setCartCountState] = useState(0);
  const { isAuthenticated, isLoading } = useAuth();

  const fetchCartCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCountState(0);
      return;
    }

    try {
      const response = await fetch('/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartCountState(data.count);
      } else {
        setCartCountState(0);
      }
    } catch {
      setCartCountState(0);
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    if (isAuthenticated) {
      fetchCartCount();
    } else {
      setCartCountState(0);
    }
  }, [isAuthenticated, isLoading, fetchCartCount]);

  const refreshCart = useCallback(async () => {
    await fetchCartCount();
  }, [fetchCartCount]);

  const incrementCart = useCallback(() => {
    setCartCountState((prev) => prev + 1);
  }, []);

  const decrementCart = useCallback(() => {
    setCartCountState((prev) => Math.max(0, prev - 1));
  }, []);

  const setCartCount = useCallback((count: number) => {
    setCartCountState(count);
  }, []);

  const value: CartContextType = {
    cartCount,
    refreshCart,
    incrementCart,
    decrementCart,
    setCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
