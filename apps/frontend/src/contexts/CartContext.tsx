import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { guestCartStorage } from '../utils/guestStorage';

interface CartContextType {
  cartCount: number;
  refreshCart: () => Promise<void>;
  incrementCart: (amount?: number) => void;
  decrementCart: (amount?: number) => void;
  setCartCount: (count: number) => void;
  isGuest: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartCount, setCartCountState] = useState(0);
  const { isAuthenticated, isLoading } = useAuth();

  const fetchCartCount = useCallback(async () => {
    if (isAuthenticated) {
      const token = localStorage.getItem('user_token');
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
    } else {
      const guestCount = guestCartStorage.getCount();
      setCartCountState(guestCount);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    
    fetchCartCount();
  }, [isAuthenticated, isLoading, fetchCartCount]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'guest_cart' && !isAuthenticated) {
        const guestCount = guestCartStorage.getCount();
        setCartCountState(guestCount);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  const refreshCart = useCallback(async () => {
    await fetchCartCount();
  }, [fetchCartCount]);

  const incrementCart = useCallback((amount: number = 1) => {
    setCartCountState((prev) => prev + amount);
  }, []);

  const decrementCart = useCallback((amount: number = 1) => {
    setCartCountState((prev) => Math.max(0, prev - amount));
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
    isGuest: !isAuthenticated,
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
