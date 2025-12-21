const GUEST_CART_KEY = 'guest_cart';
const GUEST_WISHLIST_KEY = 'guest_wishlist';
const STORAGE_VERSION = 'v1';

export interface GuestCartItem {
  id: string;
  productId: string;
  productName: string;
  optionId: string | null;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  thumbnailUrl: string;
  addedAt: string;
}

export interface GuestWishlistItem {
  productId: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  thumbnailUrl: string;
  addedAt: string;
}

interface GuestStorageData<T> {
  version: string;
  items: T[];
  updatedAt: string;
}

function getStorageData<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    
    const parsed: GuestStorageData<T> = JSON.parse(data);
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(key);
      return [];
    }
    
    return parsed.items || [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function setStorageData<T>(key: string, items: T[]): void {
  try {
    const data: GuestStorageData<T> = {
      version: STORAGE_VERSION,
      items,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export const guestCartStorage = {
  getItems(): GuestCartItem[] {
    return getStorageData<GuestCartItem>(GUEST_CART_KEY);
  },

  addItem(item: Omit<GuestCartItem, 'id' | 'addedAt'>): GuestCartItem {
    const items = this.getItems();
    const existingIndex = items.findIndex(
      (i) => i.productId === item.productId && i.optionId === item.optionId
    );

    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity;
      items[existingIndex].totalPrice = items[existingIndex].quantity * items[existingIndex].unitPrice;
      setStorageData(GUEST_CART_KEY, items);
      return items[existingIndex];
    }

    const newItem: GuestCartItem = {
      ...item,
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStorageData(GUEST_CART_KEY, items);
    return newItem;
  },

  updateQuantity(itemId: string, quantity: number): void {
    const items = this.getItems();
    const item = items.find((i) => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      item.totalPrice = quantity * item.unitPrice;
      setStorageData(GUEST_CART_KEY, items);
    }
  },

  removeItem(itemId: string): void {
    const items = this.getItems().filter((i) => i.id !== itemId);
    setStorageData(GUEST_CART_KEY, items);
  },

  removeItems(itemIds: string[]): void {
    const items = this.getItems().filter((i) => !itemIds.includes(i.id));
    setStorageData(GUEST_CART_KEY, items);
  },

  clear(): void {
    localStorage.removeItem(GUEST_CART_KEY);
  },

  getCount(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },
};

export const guestWishlistStorage = {
  getItems(): GuestWishlistItem[] {
    return getStorageData<GuestWishlistItem>(GUEST_WISHLIST_KEY);
  },

  addItem(item: Omit<GuestWishlistItem, 'addedAt'>): GuestWishlistItem {
    const items = this.getItems();
    const existing = items.find((i) => i.productId === item.productId);
    
    if (existing) {
      return existing;
    }

    const newItem: GuestWishlistItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    items.push(newItem);
    setStorageData(GUEST_WISHLIST_KEY, items);
    return newItem;
  },

  removeItem(productId: string): void {
    const items = this.getItems().filter((i) => i.productId !== productId);
    setStorageData(GUEST_WISHLIST_KEY, items);
  },

  isWishlisted(productId: string): boolean {
    return this.getItems().some((i) => i.productId === productId);
  },

  clear(): void {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  },

  getCount(): number {
    return this.getItems().length;
  },
};
