import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '../../layouts';
import { fetchAdminOrders, OrderStatus, PaymentMethod, AdminOrderDto } from './api/adminOrderApi';
import './OrderManagement.css';

const orderStatusOptions: { code: OrderStatus; label: string }[] = [
  { code: 'ALL', label: '전체' },
  { code: 'PAYMENT_COMPLETED', label: '결제완료' },
  { code: 'PREPARING', label: '상품준비중' },
  { code: 'SHIPPING', label: '배송중' },
  { code: 'DELIVERED', label: '배송완료' },
  { code: 'CANCELLED', label: '주문취소' },
  { code: 'PAYMENT_PENDING', label: '입금 전' },
];

const paymentMethodOptions: { code: PaymentMethod; label: string }[] = [
  { code: 'ALL', label: '결제수단' },
  { code: 'CARD', label: '신용카드' },
  { code: 'ACCOUNT_TRANSFER', label: '무통장 입금' },
  { code: 'NAVER_PAY', label: '네이버페이' },
  { code: 'KAKAO_PAY', label: '카카오페이' },
];

const statusLabelMap: Record<Exclude<OrderStatus, 'ALL'>, string> = {
  PAYMENT_COMPLETED: '결제완료',
  PREPARING: '상품준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '주문취소',
  PAYMENT_PENDING: '입금 전',
};

const statusClassMap: Record<Exclude<OrderStatus, 'ALL'>, string> = {
  PAYMENT_COMPLETED: 'order-status--paid',
  PREPARING: 'order-status--preparing',
  SHIPPING: 'order-status--shipping',
  DELIVERED: 'order-status--delivered',
  CANCELLED: 'order-status--cancelled',
  PAYMENT_PENDING: 'order-status--pending',
};

const paymentMethodLabelMap: Record<Exclude<PaymentMethod, 'ALL'>, string> = {
  CARD: '신용카드',
  ACCOUNT_TRANSFER: '무통장 입금',
  NAVER_PAY: '네이버페이',
  KAKAO_PAY: '카카오페이',
};

export function OrderManagementPage() {
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminOrders', orderStatusFilter, paymentMethodFilter, searchKeyword],
    queryFn: () => fetchAdminOrders({
      status: orderStatusFilter,
      paymentMethod: paymentMethodFilter,
      search: searchKeyword,
      limit: 100,
    }),
  });

  const orders = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const formatPrice = (price: number) => price.toLocaleString();

  const renderOrderStatus = (status: Exclude<OrderStatus, 'ALL'>) => {
    return (
      <span className={`order-status-pill ${statusClassMap[status]}`}>
        {statusLabelMap[status]}
      </span>
    );
  };

  const renderPaymentMethod = (method: Exclude<PaymentMethod, 'ALL'> | null) => {
    if (!method) return '-';
    return paymentMethodLabelMap[method] || '-';
  };

  return (
    <AdminLayout
      title="주문 관리"
      description="사용자의 주문 현황을 한눈에 확인하고 관리합니다"
    >
      <div className="order-management">
        <div className="order-management__toolbar">
          <div className="order-management__toolbar-left">
            <span className="order-management__total">총 주문 수 · {totalCount.toLocaleString()}</span>
          </div>
          <div className="order-management__toolbar-right">
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
              onChange={(event) => setOrderStatusFilter(event.target.value as OrderStatus)}
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
              onChange={(event) => setPaymentMethodFilter(event.target.value as PaymentMethod)}
            >
              {paymentMethodOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isError && (
          <div className="order-table__error">
            <p className="order-table__error-message">주문 목록을 불러오는데 실패했습니다</p>
          </div>
        )}

        {!isError && (
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
              <div className="order-table__header-cell order-table__header-cell--action">관리</div>
            </div>

            {isLoading ? (
              <div className="order-table__loading">로딩 중...</div>
            ) : orders.length === 0 ? (
              <div className="order-table__empty">조건에 맞는 주문이 없습니다.</div>
            ) : (
              orders.map((order: AdminOrderDto) => (
                <div key={order.id} className="order-table__row">
                  <div className="order-table__cell order-table__cell--customer">
                    <div className="order-table__customer-name">{order.customerName}</div>
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
                    <div className="order-table__primary">{formatPrice(order.totalAmount)}</div>
                  </div>
                  <div className="order-table__cell">
                    {renderOrderStatus(order.orderStatus)}
                  </div>
                  <div className="order-table__cell">
                    <div className="order-table__primary">{renderPaymentMethod(order.paymentMethod)}</div>
                  </div>
                  <div className="order-table__cell">
                    <div className="order-table__primary">{order.shippingCompany || '-'}</div>
                  </div>
                  <div className="order-table__cell">
                    <div className="order-table__primary">{order.trackingNumber || '-'}</div>
                  </div>
                  <div className="order-table__cell order-table__cell--action">
                    <button type="button" className="order-table__link">보기</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
