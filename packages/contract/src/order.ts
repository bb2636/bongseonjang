export type OrderStatus = 
  | 'PENDING'
  | 'PAID'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  productThumbnail: string | null;
  optionId: number | null;
  optionName: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItemDto[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  paidAt: string | null;
}

export interface OrderDetailDto extends OrderDto {
  shippingAddress: ShippingAddressDto;
  payment: PaymentDto | null;
  statusHistory: OrderStatusHistoryDto[];
}

export interface ShippingAddressDto {
  id: string;
  recipientName: string;
  phone: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

export interface PaymentDto {
  id: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  paidAt: string | null;
  transactionId: string | null;
}

export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'ACCOUNT_TRANSFER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface OrderStatusHistoryDto {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  couponId?: number;
  usePoints?: number;
  orderNote?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  optionId?: number;
  quantity: number;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  paymentUrl?: string;
}

export interface OrderHistoryRequest {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export interface OrderHistoryResponse {
  orders: OrderDto[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
