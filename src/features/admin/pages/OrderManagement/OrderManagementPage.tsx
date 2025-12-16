import { useMemo, useState } from 'react';
import { AdminLayout } from '../../layouts';
import './OrderManagement.css';

type OrderStatus =
  | 'ALL'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

type DeliveryStatus = 'ALL' | 'NOT_ASSIGNED' | 'IN_PREPARATION' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';

type PaymentMethod = 'CARD' | 'ACCOUNT_TRANSFER' | 'NAVER_PAY' | 'KAKAO_PAY';

type OrderRow = {
  id: number;
  orderNumber: string;
  orderDate: string;
  orderStatus: Exclude<OrderStatus, 'ALL'>;
  deliveryStatus: Exclude<DeliveryStatus, 'ALL'>;
  customerName: string;
  phoneNumber: string;
  email: string;
  productName: string;
  optionName: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  pointsUsed: number;
  couponDiscount: number;
  paymentStatus: 'PAID' | 'UNPAID' | 'CANCELLED';
  shippingCompany?: string;
  trackingNumber?: string;
};

type ShippingForm = {
  shippingCompany: string;
  trackingNumber: string;
};

const initialOrders: OrderRow[] = [
  {
    id: 1,
    orderNumber: 'BSS20250317-0003',
    orderDate: '2025-03-17',
    orderStatus: 'DELIVERED',
    deliveryStatus: 'DELIVERED',
    customerName: 'user01',
    phoneNumber: '010-9999-9999',
    email: 'shoo@google.com',
    productName: '제주 오메기떡 10개입',
    optionName: '선물포장',
    quantity: 1,
    paymentMethod: 'CARD',
    totalAmount: 22000,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'PAID',
    shippingCompany: 'CJ대한통운',
    trackingNumber: '1123123123123',
  },
  {
    id: 2,
    orderNumber: 'BSS20250317-0002',
    orderDate: '2025-03-17',
    orderStatus: 'SHIPPING',
    deliveryStatus: 'IN_TRANSIT',
    customerName: '테스트아이디',
    phoneNumber: '010-9111-2222',
    email: 'test@google.com',
    productName: '제주 오메기떡 10개입',
    optionName: '기본',
    quantity: 1,
    paymentMethod: 'CARD',
    totalAmount: 22000,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'PAID',
    shippingCompany: '롯데택배',
    trackingNumber: '123412341234',
  },
  {
    id: 3,
    orderNumber: 'BSS20250317-0001',
    orderDate: '2025-03-17',
    orderStatus: 'SHIPPING',
    deliveryStatus: 'IN_TRANSIT',
    customerName: '테스트아이디',
    phoneNumber: '010-4444-4444',
    email: 'tesa@gmail.com',
    productName: '성게 미역국',
    optionName: '제주숲 미역',
    quantity: 1,
    paymentMethod: 'CARD',
    totalAmount: 7000,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'PAID',
    shippingCompany: '한진택배',
    trackingNumber: '999988887777',
  },
  {
    id: 4,
    orderNumber: 'BSS20250317-0000',
    orderDate: '2025-03-17',
    orderStatus: 'PREPARING',
    deliveryStatus: 'IN_PREPARATION',
    customerName: 'user02',
    phoneNumber: '010-8721-0913',
    email: 'tiny6077@google.com',
    productName: '무항생제 제주 돼지고기 세트',
    optionName: '추가: 허브솔트',
    quantity: 2,
    paymentMethod: 'CARD',
    totalAmount: 134700,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'PAID',
    shippingCompany: '택배사 선택',
    trackingNumber: '',
  },
  {
    id: 5,
    orderNumber: 'BSS20250311-0001',
    orderDate: '2025-03-11',
    orderStatus: 'PAYMENT_PENDING',
    deliveryStatus: 'NOT_ASSIGNED',
    customerName: '박소영',
    phoneNumber: '010-0000-0000',
    email: 'aaaaaa@naver.com',
    productName: '한우 치마살 600g',
    optionName: '600g',
    quantity: 1,
    paymentMethod: 'ACCOUNT_TRANSFER',
    totalAmount: 32000,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'UNPAID',
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 6,
    orderNumber: 'BSS20250310-0001',
    orderDate: '2025-03-10',
    orderStatus: 'PAYMENT_PENDING',
    deliveryStatus: 'NOT_ASSIGNED',
    customerName: '이소정',
    phoneNumber: '010-0000-0000',
    email: 'kh4mani@naver.com',
    productName: '성게 미역국',
    optionName: '제주숲 미역',
    quantity: 1,
    paymentMethod: 'ACCOUNT_TRANSFER',
    totalAmount: 7000,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'UNPAID',
    shippingCompany: undefined,
    trackingNumber: undefined,
  },
  {
    id: 7,
    orderNumber: 'BSS20250201-0003',
    orderDate: '2025-02-01',
    orderStatus: 'DELIVERED',
    deliveryStatus: 'DELIVERED',
    customerName: '박소영',
    phoneNumber: '010-0000-0000',
    email: 'aaaaaa@naver.com',
    productName: '제주 오메기떡 20개입',
    optionName: '20개입',
    quantity: 1,
    paymentMethod: 'NAVER_PAY',
    totalAmount: 42000,
    pointsUsed: 0,
    couponDiscount: 4200,
    paymentStatus: 'PAID',
    shippingCompany: 'CJ대한통운',
    trackingNumber: '1234-2345-6544',
  },
  {
    id: 8,
    orderNumber: 'BSS20250201-0000',
    orderDate: '2025-02-01',
    orderStatus: 'DELIVERED',
    deliveryStatus: 'DELIVERED',
    customerName: 'tester',
    phoneNumber: '010-0000-0000',
    email: 'test@example.com',
    productName: '한라봉 5kg',
    optionName: '선물세트',
    quantity: 1,
    paymentMethod: 'NAVER_PAY',
    totalAmount: 18000,
    pointsUsed: 0,
    couponDiscount: 0,
    paymentStatus: 'PAID',
    shippingCompany: 'CJ대한통운',
    trackingNumber: '1111-2222-3333',
  },
];

const orderStatusFilters: { code: OrderStatus; label: string }[] = [
  { code: 'ALL', label: '전체' },
  { code: 'PAYMENT_PENDING', label: '입금 전' },
  { code: 'PAYMENT_COMPLETED', label: '결제완료' },
  { code: 'PREPARING', label: '상품준비중' },
  { code: 'SHIPPING', label: '배송중' },
  { code: 'DELIVERED', label: '배송완료' },
  { code: 'CANCELLED', label: '주문취소' },
];

const deliveryStatusFilters: { code: DeliveryStatus; label: string }[] = [
  { code: 'ALL', label: '전체' },
  { code: 'NOT_ASSIGNED', label: '택배사 미배정' },
  { code: 'IN_PREPARATION', label: '배송준비중' },
  { code: 'IN_TRANSIT', label: '배송중' },
  { code: 'DELIVERED', label: '배송완료' },
  { code: 'CANCELLED', label: '취소' },
];

const shippingCompanies = [
  'CJ대한통운',
  '한진택배',
  '롯데택배',
  '우체국택배',
  '쿠팡로켓배송',
  '위스타고',
  '용마택배',
  '농협택배',
  '경동택배',
  '천일택배',
];

export function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<OrderStatus>('ALL');
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<DeliveryStatus>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [shippingForm, setShippingForm] = useState<ShippingForm>({ shippingCompany: '', trackingNumber: '' });

  const statusCounts = useMemo(() => {
    return orderStatusFilters.reduce<Record<OrderStatus, number>>((counts, status) => {
      const count = orders.filter((order) => status.code === 'ALL' || order.orderStatus === status.code).length;
      return { ...counts, [status.code]: count };
    }, {
      ALL: orders.length,
      PAYMENT_PENDING: 0,
      PAYMENT_COMPLETED: 0,
      PREPARING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesOrderStatus = selectedOrderStatus === 'ALL' || order.orderStatus === selectedOrderStatus;
      const matchesDeliveryStatus = selectedDeliveryStatus === 'ALL' || order.deliveryStatus === selectedDeliveryStatus;

      const keyword = searchKeyword.trim().toLowerCase();
      const matchesKeyword = keyword.length === 0
        || order.orderNumber.toLowerCase().includes(keyword)
        || order.customerName.toLowerCase().includes(keyword)
        || order.productName.toLowerCase().includes(keyword);

      const withinFromDate = fromDate ? new Date(order.orderDate) >= new Date(fromDate) : true;
      const withinToDate = toDate ? new Date(order.orderDate) <= new Date(toDate) : true;

      return matchesOrderStatus && matchesDeliveryStatus && matchesKeyword && withinFromDate && withinToDate;
    });
  }, [orders, selectedOrderStatus, selectedDeliveryStatus, searchKeyword, fromDate, toDate]);

  const openShippingDialog = (orderId: number) => {
    const order = orders.find((row) => row.id === orderId);
    if (!order) {
      return;
    }

    setEditingOrderId(orderId);
    setShippingForm({
      shippingCompany: order.shippingCompany || '',
      trackingNumber: order.trackingNumber || '',
    });
    setIsShippingDialogOpen(true);
  };

  const closeShippingDialog = () => {
    setEditingOrderId(null);
    setIsShippingDialogOpen(false);
  };

  const handleShippingFormChange = (key: keyof ShippingForm, value: string) => {
    setShippingForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleShippingSubmit = () => {
    if (!editingOrderId) {
      return;
    }

    setOrders((prev) => prev.map((order) => {
      if (order.id !== editingOrderId) {
        return order;
      }

      return {
        ...order,
        shippingCompany: shippingForm.shippingCompany,
        trackingNumber: shippingForm.trackingNumber,
        deliveryStatus: shippingForm.trackingNumber ? 'IN_TRANSIT' : order.deliveryStatus,
        orderStatus: shippingForm.trackingNumber ? 'SHIPPING' : order.orderStatus,
      };
    }));

    closeShippingDialog();
  };

  const getOrderStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PAYMENT_PENDING':
        return '입금 전';
      case 'PAYMENT_COMPLETED':
        return '결제완료';
      case 'PREPARING':
        return '상품준비중';
      case 'SHIPPING':
        return '배송중';
      case 'DELIVERED':
        return '배송완료';
      case 'CANCELLED':
        return '주문취소';
      default:
        return '전체';
    }
  };

  const getDeliveryStatusLabel = (status: DeliveryStatus) => {
    switch (status) {
      case 'NOT_ASSIGNED':
        return '택배사 미배정';
      case 'IN_PREPARATION':
        return '배송준비중';
      case 'IN_TRANSIT':
        return '배송중';
      case 'DELIVERED':
        return '배송완료';
      case 'CANCELLED':
        return '취소';
      default:
        return '전체';
    }
  };

  const formatPrice = (price: number) => price.toLocaleString();

  const renderOrderStatusBadge = (status: OrderStatus) => {
    const label = getOrderStatusLabel(status);
    return <span className={`order-status order-status--${status.toLowerCase()}`}>{label}</span>;
  };

  const renderDeliveryStatusBadge = (status: DeliveryStatus) => {
    const label = getDeliveryStatusLabel(status);
    return <span className={`delivery-status delivery-status--${status.toLowerCase()}`}>{label}</span>;
  };

  const renderPaymentBadge = (status: OrderRow['paymentStatus']) => {
    const label = status === 'PAID' ? '결제완료' : status === 'UNPAID' ? '입금대기' : '결제취소';
    return <span className={`payment-status payment-status--${status.toLowerCase()}`}>{label}</span>;
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'CARD':
        return '신용카드';
      case 'ACCOUNT_TRANSFER':
        return '계좌이체';
      case 'NAVER_PAY':
        return '네이버페이';
      case 'KAKAO_PAY':
        return '카카오페이';
      default:
        return '기타';
    }
  };

  const renderShippingAction = (order: OrderRow) => {
    if (order.deliveryStatus === 'DELIVERED') {
      return <button className="order-table__action-button order-table__action-button--text">상세보기</button>;
    }

    return (
      <button
        className="order-table__action-button"
        onClick={() => openShippingDialog(order.id)}
      >
        택배사 정보 입력
      </button>
    );
  };

  return (
    <AdminLayout
      title="주문 관리"
      description="사용자의 주문 현황을 한눈에 확인하고 관리합니다"
    >
      <div className="order-management">
        <div className="order-management__filters">
          <div className="order-management__filter-group">
            {orderStatusFilters.map((status) => (
              <button
                key={status.code}
                className={`order-status-filter ${selectedOrderStatus === status.code ? 'order-status-filter--active' : ''}`}
                onClick={() => setSelectedOrderStatus(status.code)}
              >
                <span className="order-status-filter__label">{status.label}</span>
                <span className="order-status-filter__count">{statusCounts[status.code]}</span>
              </button>
            ))}
          </div>

          <div className="order-management__filter-group">
            {deliveryStatusFilters.map((status) => (
              <button
                key={status.code}
                className={`delivery-status-filter ${selectedDeliveryStatus === status.code ? 'delivery-status-filter--active' : ''}`}
                onClick={() => setSelectedDeliveryStatus(status.code)}
              >
                <span className="delivery-status-filter__label">{status.label}</span>
              </button>
            ))}
          </div>

          <div className="order-management__search-panel">
            <div className="order-management__search-row">
              <div className="order-management__search-field">
                <label>검색어</label>
                <div className="order-management__search-field-inputs">
                  <select className="order-management__select">
                    <option value="orderNumber">주문번호</option>
                    <option value="customer">주문자</option>
                    <option value="product">상품명</option>
                  </select>
                  <input
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchKeyword}
                    onChange={(event) => setSearchKeyword(event.target.value)}
                  />
                </div>
              </div>
              <div className="order-management__search-field">
                <label>기간</label>
                <div className="order-management__date-range">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                  />
                  <span className="order-management__date-separator">~</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                  />
                  <div className="order-management__date-shortcuts">
                    <button
                      onClick={() => {
                        setFromDate('');
                        setToDate('');
                      }}
                    >
                      전체
                    </button>
                    <button
                      onClick={() => {
                        const today = new Date().toISOString().slice(0, 10);
                        setFromDate(today);
                        setToDate(today);
                      }}
                    >
                      오늘
                    </button>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const from = new Date(now);
                        from.setDate(now.getDate() - 7);
                        setFromDate(from.toISOString().slice(0, 10));
                        setToDate(now.toISOString().slice(0, 10));
                      }}
                    >
                      1주일
                    </button>
                    <button
                      onClick={() => {
                        const now = new Date();
                        const from = new Date(now);
                        from.setMonth(now.getMonth() - 1);
                        setFromDate(from.toISOString().slice(0, 10));
                        setToDate(now.toISOString().slice(0, 10));
                      }}
                    >
                      1개월
                    </button>
                  </div>
                </div>
              </div>
              <div className="order-management__search-actions">
                <button className="order-management__search-button">검색</button>
              </div>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <div className="order-summary__item">
            <span className="order-summary__label">기간 내 전체 주문</span>
            <span className="order-summary__value">{filteredOrders.length} 건</span>
          </div>
          <div className="order-summary__item">
            <span className="order-summary__label">총 결제 금액</span>
            <span className="order-summary__value">
              {formatPrice(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0))} 원
            </span>
          </div>
          <div className="order-summary__item">
            <span className="order-summary__label">배송 준비</span>
            <span className="order-summary__value">{filteredOrders.filter((order) => order.deliveryStatus === 'IN_PREPARATION').length} 건</span>
          </div>
          <div className="order-summary__item">
            <span className="order-summary__label">배송중</span>
            <span className="order-summary__value">{filteredOrders.filter((order) => order.deliveryStatus === 'IN_TRANSIT').length} 건</span>
          </div>
          <div className="order-summary__item">
            <span className="order-summary__label">배송완료</span>
            <span className="order-summary__value">{filteredOrders.filter((order) => order.deliveryStatus === 'DELIVERED').length} 건</span>
          </div>
        </div>

        <div className="order-table">
          <div className="order-table__header">
            <div className="order-table__header-cell">번호</div>
            <div className="order-table__header-cell">일시</div>
            <div className="order-table__header-cell">주문/배송상태</div>
            <div className="order-table__header-cell">주문자</div>
            <div className="order-table__header-cell">상품</div>
            <div className="order-table__header-cell">가격</div>
            <div className="order-table__header-cell">결제정보</div>
            <div className="order-table__header-cell">수량</div>
            <div className="order-table__header-cell">구매자 연락처</div>
            <div className="order-table__header-cell">배송정보</div>
          </div>

          {filteredOrders.map((order) => (
            <div key={order.id} className="order-table__row">
              <div className="order-table__cell order-table__cell--number">{String(order.id).padStart(3, '0')}</div>
              <div className="order-table__cell order-table__cell--date">
                <div className="order-table__order-number">{order.orderNumber}</div>
                <div className="order-table__order-date">{order.orderDate}</div>
              </div>
              <div className="order-table__cell order-table__cell--status">
                <div className="order-table__status-list">
                  {renderOrderStatusBadge(order.orderStatus)}
                  {renderDeliveryStatusBadge(order.deliveryStatus)}
                  {renderPaymentBadge(order.paymentStatus)}
                </div>
              </div>
              <div className="order-table__cell order-table__cell--customer">
                <div className="order-table__customer-name">{order.customerName}</div>
                <div className="order-table__customer-email">{order.email}</div>
              </div>
              <div className="order-table__cell order-table__cell--product">
                <div className="order-table__product-name">{order.productName}</div>
                <div className="order-table__product-option">옵션: {order.optionName}</div>
              </div>
              <div className="order-table__cell order-table__cell--price">
                <div className="order-table__price">{formatPrice(order.totalAmount)}원</div>
                <div className="order-table__price-detail">포인트 {formatPrice(order.pointsUsed)} | 쿠폰 {formatPrice(order.couponDiscount)}</div>
              </div>
              <div className="order-table__cell order-table__cell--payment">
                <div className="order-table__payment-method">{getPaymentMethodLabel(order.paymentMethod)}</div>
                <div className="order-table__payment-status">{renderPaymentBadge(order.paymentStatus)}</div>
              </div>
              <div className="order-table__cell order-table__cell--quantity">{order.quantity}</div>
              <div className="order-table__cell order-table__cell--contact">
                <div className="order-table__contact-name">{order.customerName}</div>
                <div className="order-table__contact-phone">{order.phoneNumber}</div>
              </div>
              <div className="order-table__cell order-table__cell--shipping">
                <div className="order-table__shipping-company">{order.shippingCompany || '택배사 선택'}</div>
                <div className="order-table__tracking-number">{order.trackingNumber || '송장번호 없음'}</div>
                {renderShippingAction(order)}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="order-table__empty">해당 조건의 주문이 없습니다.</div>
          )}
        </div>
      </div>

      {isShippingDialogOpen && (
        <div className="shipping-dialog__backdrop" onClick={closeShippingDialog}>
          <div className="shipping-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="shipping-dialog__header">
              <h2>택배사 정보 입력</h2>
            </div>
            <div className="shipping-dialog__body">
              <div className="shipping-dialog__field">
                <label htmlFor="shippingCompany">택배사 선택</label>
                <select
                  id="shippingCompany"
                  value={shippingForm.shippingCompany}
                  onChange={(event) => handleShippingFormChange('shippingCompany', event.target.value)}
                >
                  <option value="">선택</option>
                  {shippingCompanies.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              <div className="shipping-dialog__field">
                <label htmlFor="trackingNumber">송장번호</label>
                <input
                  id="trackingNumber"
                  type="text"
                  placeholder="송장번호를 입력해주세요"
                  value={shippingForm.trackingNumber}
                  onChange={(event) => handleShippingFormChange('trackingNumber', event.target.value)}
                />
              </div>
            </div>
            <div className="shipping-dialog__footer">
              <button className="shipping-dialog__button shipping-dialog__button--ghost" onClick={closeShippingDialog}>
                취소
              </button>
              <button className="shipping-dialog__button shipping-dialog__button--primary" onClick={handleShippingSubmit}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
