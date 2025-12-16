export enum AdminOrderStatus {
  PaymentPending = 'PAYMENT_PENDING',
  Paid = 'PAID',
  Preparing = 'PREPARING',
  Shipping = 'SHIPPING',
  Delivered = 'DELIVERED',
  Canceled = 'CANCELED',
  Refunded = 'REFUNDED',
}

export enum AdminPaymentMethod {
  Card = 'CARD',
  VirtualBank = 'VBANK',
  BankTransfer = 'BANK',
  NaverPay = 'NAVERPAY',
  KakaoPay = 'KAKAOPAY',
}

export enum AdminPaymentStatus {
  Ready = 'READY',
  Paid = 'PAID',
  Failed = 'FAILED',
  Canceled = 'CANCELED',
  Refunded = 'REFUNDED',
}

export enum AdminShipmentStatus {
  Ready = 'READY',
  Shipped = 'SHIPPED',
  InTransit = 'IN_TRANSIT',
  Delivered = 'DELIVERED',
  Returned = 'RETURNED',
}

export interface AdminOrderSnapshot {
  id: string;
  orderNumber: string;
  userId: string | null;
  ordererName: string;
  ordererPhone: string;
  ordererEmail: string;
  orderStatus: AdminOrderStatus;
  itemsAmount: number;
  shippingFee: number;
  discountAmount: number;
  pointUsedAmount: number;
  totalPaidAmount: number;
  orderedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderItemOptionSnapshot = Record<string, unknown> | string;

export interface AdminOrderItemSnapshot {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  optionSnapshot: OrderItemOptionSnapshot;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  createdAt: string;
}

export interface AdminOrderAddressSnapshot {
  id: string;
  orderId: string;
  receiverName: string;
  receiverPhone: string;
  zipcode: string;
  addressLine1: string;
  addressLine2: string;
  deliveryMemo: string;
  createdAt: string;
}

export interface AdminPaymentSnapshot {
  id: string;
  orderId: string;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: AdminPaymentStatus;
  paidAmount: number;
  approvedAt: string;
  paymentGatewayProvider: string;
  paymentGatewayTransactionId: string;
  createdAt: string;
}

export interface AdminShipmentSnapshot {
  id: string;
  orderId: string;
  carrierCode: string;
  trackingNumber: string;
  shipmentStatus: AdminShipmentStatus;
  shippedAt: string;
  deliveredAt: string;
  createdAt: string;
}

export interface AdminOrderDetail {
  order: AdminOrderSnapshot;
  items: AdminOrderItemSnapshot[];
  address: AdminOrderAddressSnapshot | null;
  payment: AdminPaymentSnapshot | null;
  shipments: AdminShipmentSnapshot[];
}

export const ADMIN_ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  [AdminOrderStatus.PaymentPending]: '결제 대기',
  [AdminOrderStatus.Paid]: '결제 완료',
  [AdminOrderStatus.Preparing]: '상품 준비중',
  [AdminOrderStatus.Shipping]: '배송중',
  [AdminOrderStatus.Delivered]: '배송 완료',
  [AdminOrderStatus.Canceled]: '취소',
  [AdminOrderStatus.Refunded]: '환불 완료',
};

export const ADMIN_PAYMENT_STATUS_LABELS: Record<AdminPaymentStatus, string> = {
  [AdminPaymentStatus.Ready]: '결제 대기',
  [AdminPaymentStatus.Paid]: '결제 완료',
  [AdminPaymentStatus.Failed]: '결제 실패',
  [AdminPaymentStatus.Canceled]: '결제 취소',
  [AdminPaymentStatus.Refunded]: '환불 완료',
};

export const ADMIN_SHIPMENT_STATUS_LABELS: Record<AdminShipmentStatus, string> = {
  [AdminShipmentStatus.Ready]: '배송 준비',
  [AdminShipmentStatus.Shipped]: '출고 완료',
  [AdminShipmentStatus.InTransit]: '배송중',
  [AdminShipmentStatus.Delivered]: '배송 완료',
  [AdminShipmentStatus.Returned]: '반송',
};
