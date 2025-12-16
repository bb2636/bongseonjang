import { useMemo, useState } from "react";
import { AdminLayout } from "../../layouts";
import "./OrderManagement.css";

type OrderStatus =
  | "ALL"
  | "PAYMENT_COMPLETED"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "CANCELLED"
  | "PAYMENT_PENDING";

type PaymentMethod = "CARD" | "ACCOUNT_TRANSFER" | "NAVER_PAY" | "KAKAO_PAY";

type OrderRow = {
  id: number;
  orderNumber: string;
  orderedAt: string;
  orderStatus: Exclude<OrderStatus, "ALL">;
  customerName: string;
  phoneNumber: string;
  email: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingCompany?: string;
  trackingNumber?: string;
};

const initialOrders: OrderRow[] = [
  {
    id: 1,
    orderNumber: "BS202412150001",
    orderedAt: "2025-01-15 12:00:00",
    orderStatus: "PAYMENT_COMPLETED",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 56000,
    paymentMethod: "CARD",
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 2,
    orderNumber: "BS202412150002",
    orderedAt: "2025-01-15 12:05:00",
    orderStatus: "PAYMENT_COMPLETED",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "CARD",
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 3,
    orderNumber: "BS202412150003",
    orderedAt: "2025-01-15 12:10:00",
    orderStatus: "PREPARING",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "ACCOUNT_TRANSFER",
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 4,
    orderNumber: "BS202412150004",
    orderedAt: "2025-01-15 12:15:00",
    orderStatus: "PAYMENT_COMPLETED",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "CARD",
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 5,
    orderNumber: "BS202412150005",
    orderedAt: "2025-01-15 12:20:00",
    orderStatus: "CANCELLED",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "CARD",
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 6,
    orderNumber: "BS202412150006",
    orderedAt: "2025-01-15 12:25:00",
    orderStatus: "SHIPPING",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "CARD",
    shippingCompany: "롯데택배",
    trackingNumber: "0000000000",
  },
  {
    id: 7,
    orderNumber: "BS202412150007",
    orderedAt: "2025-01-15 12:30:00",
    orderStatus: "PAYMENT_PENDING",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "ACCOUNT_TRANSFER",
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 8,
    orderNumber: "BS202412150008",
    orderedAt: "2025-01-15 12:35:00",
    orderStatus: "SHIPPING",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "CARD",
    shippingCompany: "CJ 대한통운",
    trackingNumber: "0000000000",
  },
  {
    id: 9,
    orderNumber: "BS202412150009",
    orderedAt: "2025-01-15 12:40:00",
    orderStatus: "DELIVERED",
    customerName: "김블락",
    phoneNumber: "010-0000-0000",
    email: "xblock@gmail.com",
    totalAmount: 21000,
    paymentMethod: "CARD",
    shippingCompany: "CJ 대한통운",
    trackingNumber: "0000000000",
  },
];

const orderStatusOptions: { code: OrderStatus; label: string }[] = [
  { code: "ALL", label: "전체" },
  { code: "PAYMENT_COMPLETED", label: "결제완료" },
  { code: "PREPARING", label: "상품준비중" },
  { code: "SHIPPING", label: "배송중" },
  { code: "DELIVERED", label: "배송완료" },
  { code: "CANCELLED", label: "주문취소" },
  { code: "PAYMENT_PENDING", label: "입금 전" },
];

const paymentMethodOptions: { code: PaymentMethod | "ALL"; label: string }[] = [
  { code: "ALL", label: "결제수단" },
  { code: "CARD", label: "신용카드" },
  { code: "ACCOUNT_TRANSFER", label: "무통장 입금" },
  { code: "NAVER_PAY", label: "네이버페이" },
  { code: "KAKAO_PAY", label: "카카오페이" },
];

const statusLabelMap: Record<Exclude<OrderStatus, "ALL">, string> = {
  PAYMENT_COMPLETED: "결제완료",
  PREPARING: "상품준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELLED: "주문취소",
  PAYMENT_PENDING: "입금 전",
};

const statusClassMap: Record<Exclude<OrderStatus, "ALL">, string> = {
  PAYMENT_COMPLETED: "order-status--paid",
  PREPARING: "order-status--preparing",
  SHIPPING: "order-status--shipping",
  DELIVERED: "order-status--delivered",
  CANCELLED: "order-status--cancelled",
  PAYMENT_PENDING: "order-status--pending",
};

const paymentMethodLabelMap: Record<PaymentMethod, string> = {
  CARD: "신용카드",
  ACCOUNT_TRANSFER: "무통장 입금",
  NAVER_PAY: "네이버페이",
  KAKAO_PAY: "카카오페이",
};

export function OrderManagementPage() {
  const [orders] = useState<OrderRow[]>(initialOrders);
  const [orderStatusFilter, setOrderStatusFilter] =
    useState<OrderStatus>("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<
    PaymentMethod | "ALL"
  >("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredOrders = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        orderStatusFilter === "ALL" || order.orderStatus === orderStatusFilter;
      const matchesPayment =
        paymentMethodFilter === "ALL" ||
        order.paymentMethod === paymentMethodFilter;
      const matchesKeyword =
        keyword.length === 0 ||
        order.orderNumber.toLowerCase().includes(keyword) ||
        order.customerName.toLowerCase().includes(keyword) ||
        order.phoneNumber.toLowerCase().includes(keyword) ||
        order.email.toLowerCase().includes(keyword);

      return matchesStatus && matchesPayment && matchesKeyword;
    });
  }, [orderStatusFilter, orders, paymentMethodFilter, searchKeyword]);

  const formatPrice = (price: number) => price.toLocaleString();

  const renderOrderStatus = (status: Exclude<OrderStatus, "ALL">) => {
    return (
      <span className={`order-status-pill ${statusClassMap[status]}`}>
        {statusLabelMap[status]}
      </span>
    );
  };

  const renderPaymentMethod = (method: PaymentMethod) =>
    paymentMethodLabelMap[method];

  return (
    <AdminLayout
      title="주문 관리"
      description="사용자의 주문 현황을 한눈에 확인하고 관리합니다"
    >
      <div className="order-management">
        <div className="order-management__hero">
          <div className="order-management__summary">
            <span className="order-management__summary-label">총 주문 수</span>
            <span className="order-management__summary-dot" />
            <span className="order-management__summary-count">
              {orders.length.toString().padStart(4, "0")}
            </span>
          </div>
        </div>

        <div className="order-management__controls">
          <div className="order-management__search-box">
            <input
              type="text"
              placeholder="주문번호, 이름, 연락처 등으로 검색"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
            />
          </div>
          <select
            className="order-management__select"
            value={orderStatusFilter}
            onChange={(event) =>
              setOrderStatusFilter(event.target.value as OrderStatus)
            }
          >
            {orderStatusOptions.map((status) => (
              <option key={status.code} value={status.code}>
                {status.label}
              </option>
            ))}
          </select>
          <select
            className="order-management__select"
            value={paymentMethodFilter}
            onChange={(event) =>
              setPaymentMethodFilter(
                event.target.value as PaymentMethod | "ALL",
              )
            }
          >
            {paymentMethodOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="order-table">
          <div className="order-table__header">
            <div className="order-table__header-cell">주문자</div>
            <div className="order-table__header-cell">주문일시</div>
            <div className="order-table__header-cell">주문번호</div>
            <div className="order-table__header-cell">결제 금액</div>
            <div className="order-table__header-cell">주문상태</div>
            <div className="order-table__header-cell">결제 수단</div>
            <div className="order-table__header-cell">택배사</div>
            <div className="order-table__header-cell">송장번호</div>
            <div className="order-table__header-cell order-table__header-cell--action">
              관리
            </div>
          </div>

          {filteredOrders.map((order) => (
            <div key={order.id} className="order-table__row">
              <div className="order-table__cell order-table__cell--customer">
                <div className="order-table__customer-name">
                  {order.customerName}
                </div>
                <div className="order-table__customer-detail">
                  <span>{order.phoneNumber}</span>
                  <span className="order-table__bullet" />
                  <span>{order.email}</span>
                </div>
              </div>
              <div className="order-table__cell">
                <div className="order-table__primary">{order.orderedAt}</div>
              </div>
              <div className="order-table__cell">
                <div className="order-table__primary">{order.orderNumber}</div>
              </div>
              <div className="order-table__cell">
                <div className="order-table__primary">
                  {formatPrice(order.totalAmount)}
                </div>
              </div>
              <div className="order-table__cell">
                {renderOrderStatus(order.orderStatus)}
              </div>
              <div className="order-table__cell">
                <div className="order-table__primary">
                  {renderPaymentMethod(order.paymentMethod)}
                </div>
              </div>
              <div className="order-table__cell">
                <div className="order-table__primary">
                  {order.shippingCompany || "-"}
                </div>
              </div>
              <div className="order-table__cell">
                <div className="order-table__primary">
                  {order.trackingNumber || "-"}
                </div>
              </div>
              <div className="order-table__cell order-table__cell--action">
                <button type="button" className="order-table__link">
                  보기
                </button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="order-table__empty">
              조건에 맞는 주문이 없습니다.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
