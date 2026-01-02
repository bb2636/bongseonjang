export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  gender: string | null;
  isMarketingEmail: boolean;
  isMarketingSms: boolean;
  grade: string;
  points: number;
  couponCount: number;
  favoriteCount: number;
  pendingReviewCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  statusDate: string;
  items: OrderItem[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled';
