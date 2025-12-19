import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '../../layouts';
import { fetchAdminOrders, updateShippingInfo, updateOrderStatus, OrderStatus, PaymentMethod, AdminOrderDto, BackendOrderStatus } from './api/adminOrderApi';
import { TrackingNumberDialog } from './components/TrackingNumberDialog';
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
  { code: 'ACCOUNT_TRANSFER', label: '무통장입금' },
  { code: 'BANK_TRANSFER', label: '계좌이체' },
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

const frontendToBackendStatus: Record<Exclude<OrderStatus, 'ALL'>, BackendOrderStatus> = {
  PAYMENT_PENDING: 'pending',
  PAYMENT_COMPLETED: 'paid',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const orderStatusChangeOptions: { code: Exclude<OrderStatus, 'ALL'>; label: string }[] = [
  { code: 'PAYMENT_COMPLETED', label: '결제완료' },
  { code: 'PREPARING', label: '상품준비중' },
  { code: 'SHIPPING', label: '배송중' },
  { code: 'DELIVERED', label: '배송완료' },
  { code: 'CANCELLED', label: '주문취소' },
];

const paymentMethodLabelMap: Record<Exclude<PaymentMethod, 'ALL'>, string> = {
  CARD: '신용카드',
  ACCOUNT_TRANSFER: '무통장입금',
  BANK_TRANSFER: '계좌이체',
};

const COURIER_OPTIONS = [
  { id: 'cj', name: 'CJ대한통운' },
  { id: 'hanjin', name: '한진택배' },
  { id: 'lotte', name: '롯데택배' },
  { id: 'logen', name: '로젠택배' },
  { id: 'post', name: '우체국택배' },
  { id: 'gs', name: 'GS25편의점택배' },
  { id: 'cu', name: 'CU편의점택배' },
  { id: 'kyungdong', name: '경동택배' },
  { id: 'daesin', name: '대신택배' },
];

interface TrackingDialogState {
  orderId: string;
  carrierId: string;
  carrierName: string;
  currentTrackingNumber: string;
}

export function OrderManagementPage() {
  const queryClient = useQueryClient();
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [trackingDialogState, setTrackingDialogState] = useState<TrackingDialogState | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

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

  const handleStatusChange = async (order: AdminOrderDto, newStatus: Exclude<OrderStatus, 'ALL'>) => {
    setSavingOrderId(order.id);
    try {
      const backendStatus = frontendToBackendStatus[newStatus];
      await updateOrderStatus(order.id, backendStatus);
      await queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setSavingOrderId(null);
    }
  };

  const renderPaymentMethod = (method: Exclude<PaymentMethod, 'ALL'> | null) => {
    if (!method) return '-';
    return paymentMethodLabelMap[method] || '-';
  };

  const handleCarrierChange = async (order: AdminOrderDto, carrierId: string) => {
    const selectedOption = COURIER_OPTIONS.find(opt => opt.id === carrierId);
    if (!selectedOption) return;

    setSavingOrderId(order.id);
    try {
      await updateShippingInfo(order.id, {
        carrierId: carrierId,
        carrierName: selectedOption.name,
        trackingNumber: order.trackingNumber || '',
      });
      await queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    } catch (error) {
      console.error('Failed to save carrier:', error);
    } finally {
      setSavingOrderId(null);
    }
  };

  const handleTrackingCellClick = (order: AdminOrderDto) => {
    if (!order.shippingCompany) {
      return;
    }

    const currentCarrier = COURIER_OPTIONS.find(opt => opt.name === order.shippingCompany);
    const carrierId = currentCarrier?.id || order.shippingCompany;
    const carrierName = order.shippingCompany;

    setTrackingDialogState({
      orderId: order.id,
      carrierId: carrierId,
      carrierName: carrierName,
      currentTrackingNumber: order.trackingNumber || '',
    });
  };

  const handleSaveTrackingNumber = async (trackingNumber: string) => {
    if (!trackingDialogState) return;

    setSavingOrderId(trackingDialogState.orderId);
    try {
      await updateShippingInfo(trackingDialogState.orderId, {
        carrierId: trackingDialogState.carrierId,
        carrierName: trackingDialogState.carrierName,
        trackingNumber,
      });
      await queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      setTrackingDialogState(null);
    } catch (error) {
      console.error('Failed to save shipping info:', error);
    } finally {
      setSavingOrderId(null);
    }
  };

  const getCarrierIdForOrder = (order: AdminOrderDto): string => {
    if (!order.shippingCompany) return '';
    const option = COURIER_OPTIONS.find(opt => opt.name === order.shippingCompany);
    if (option) return option.id;
    return '__backend__';
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
                  <div className="order-table__cell order-table__cell--status">
                    <select
                      className={`order-table__status-select ${statusClassMap[order.orderStatus]}`}
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order, e.target.value as Exclude<OrderStatus, 'ALL'>)}
                      disabled={savingOrderId === order.id}
                    >
                      {orderStatusChangeOptions.map((status) => (
                        <option key={status.code} value={status.code}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="order-table__cell">
                    <div className="order-table__primary">{renderPaymentMethod(order.paymentMethod)}</div>
                  </div>
                  <div className="order-table__cell order-table__cell--carrier">
                    <select
                      className="order-table__carrier-select"
                      value={getCarrierIdForOrder(order)}
                      onChange={(e) => handleCarrierChange(order, e.target.value)}
                    >
                      <option value="">선택</option>
                      {order.shippingCompany && !COURIER_OPTIONS.find(opt => opt.name === order.shippingCompany) && (
                        <option value="__backend__" disabled>
                          {order.shippingCompany}
                        </option>
                      )}
                      {COURIER_OPTIONS.map((courier) => (
                        <option key={courier.id} value={courier.id}>
                          {courier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="order-table__cell order-table__cell--tracking">
                    <button
                      type="button"
                      className="order-table__tracking-button"
                      onClick={() => handleTrackingCellClick(order)}
                      disabled={!order.shippingCompany}
                    >
                      {order.trackingNumber || '입력'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <TrackingNumberDialog
        isOpen={!!trackingDialogState}
        currentValue={trackingDialogState?.currentTrackingNumber || ''}
        onClose={() => setTrackingDialogState(null)}
        onSave={handleSaveTrackingNumber}
        isSaving={!!savingOrderId}
      />
    </AdminLayout>
  );
}
