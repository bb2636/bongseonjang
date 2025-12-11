export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
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

export interface MenuItem {
  id: string;
  icon: string;
  label: string;
  path: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}
