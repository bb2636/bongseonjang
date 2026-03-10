import { useState, useEffect } from 'react';
import { fetchAdminOrderDetail, updateAdminOrderMemo, AdminOrderDetailDto } from '../../api/adminOrderApi';
import { useBodyScrollLock } from '../../../../hooks/useBodyScrollLock';
import './OrderDetailPanel.css';

interface OrderDetailPanelProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const statusLabelMap: Record<string, string> = {
  PAYMENT_PENDING: '입금 전',
  PAYMENT_FAILED: '결제실패',
  PAYMENT_COMPLETED: '결제완료',
  PREPARING: '상품준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELLED: '주문취소',
  pending: '입금 전',
  payment_failed: '결제실패',
  paid: '결제완료',
  confirmed: '주문확인',
  preparing: '상품준비중',
  shipping: '배송중',
  delivered: '배송완료',
  cancelled: '주문취소',
  refund_requested: '환불요청',
  refunded: '환불완료',
};

const statusClassMap: Record<string, string> = {
  PAYMENT_PENDING: 'order-detail-status-badge--pending',
  PAYMENT_FAILED: 'order-detail-status-badge--failed',
  PAYMENT_COMPLETED: 'order-detail-status-badge--paid',
  PREPARING: 'order-detail-status-badge--preparing',
  SHIPPING: 'order-detail-status-badge--shipping',
  DELIVERED: 'order-detail-status-badge--delivered',
  CANCELLED: 'order-detail-status-badge--cancelled',
  pending: 'order-detail-status-badge--pending',
  payment_failed: 'order-detail-status-badge--failed',
  paid: 'order-detail-status-badge--paid',
  confirmed: 'order-detail-status-badge--paid',
  preparing: 'order-detail-status-badge--preparing',
  shipping: 'order-detail-status-badge--shipping',
  delivered: 'order-detail-status-badge--delivered',
  cancelled: 'order-detail-status-badge--cancelled',
  refund_requested: 'order-detail-status-badge--cancelled',
  refunded: 'order-detail-status-badge--cancelled',
};

const paymentMethodLabelMap: Record<string, string> = {
  CARD: '신용카드',
  ACCOUNT_TRANSFER: '무통장입금',
  BANK_TRANSFER: '계좌이체',
};

export function OrderDetailPanel({ orderId, isOpen, onClose }: OrderDetailPanelProps) {
  const [order, setOrder] = useState<AdminOrderDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  useBodyScrollLock(isOpen);
  const [adminMemo, setAdminMemo] = useState('');
  const [isSavingMemo, setIsSavingMemo] = useState(false);
  const [memoSaveSuccess, setMemoSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminOrderDetail(orderId);
      setOrder(data);
      setAdminMemo(data.adminMemo || '');
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMemo = async () => {
    setIsSavingMemo(true);
    setMemoSaveSuccess(false);
    try {
      await updateAdminOrderMemo(orderId, adminMemo);
      setMemoSaveSuccess(true);
      setTimeout(() => setMemoSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setIsSavingMemo(false);
    }
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatStatus = (status: string): string => {
    return statusLabelMap[status] || status;
  };

  const getStatusClass = (status: string): string => {
    return statusClassMap[status] || '';
  };

  const formatPaymentMethod = (method: string | null): string => {
    if (!method) return '-';
    return paymentMethodLabelMap[method] || method;
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="order-detail-overlay" onClick={onClose} />
      <div className="order-detail-panel">
        <div className="order-detail-header">
          <button className="order-detail-back-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="order-detail-back-text">목록으로</span>
        </div>

        {isLoading ? (
          <div className="order-detail-loading">로딩 중...</div>
        ) : order ? (
          <>
            <div className="order-detail-summary">
              <div className="order-detail-summary-content">
                <div className="order-detail-order-number">{order.orderNumber}</div>
                <div className="order-detail-info-row">
                  <span className="order-detail-info-item">{order.orderedAt}</span>
                  <span className="order-detail-info-dot" />
                  <span className={`order-detail-status-badge ${getStatusClass(order.orderStatus)}`}>{formatStatus(order.orderStatus)}</span>
                </div>
              </div>
            </div>

            <div className="order-detail-content">
              <div className="order-detail-section">
                <div className="order-detail-section-title">고객정보</div>
                <div className="order-detail-info-grid">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">주문자명</div>
                    <div className="order-detail-info-value">{order.customerName}</div>
                  </div>
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">연락처</div>
                    <div className="order-detail-info-value">{order.phoneNumber}</div>
                  </div>
                </div>
                <div className="order-detail-info-grid">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">이메일</div>
                    <div className="order-detail-info-value">{order.email}</div>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-detail-section-title">주문상품</div>
                <div className="order-detail-items-table">
                  <div className="order-detail-items-header">
                    <div className="order-detail-items-cell order-detail-items-cell--product">상품명</div>
                    <div className="order-detail-items-cell order-detail-items-cell--option">옵션</div>
                    <div className="order-detail-items-cell order-detail-items-cell--qty">수량</div>
                    <div className="order-detail-items-cell order-detail-items-cell--price">단가</div>
                    <div className="order-detail-items-cell order-detail-items-cell--subtotal">소계</div>
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="order-detail-items-row">
                      <div className="order-detail-items-cell order-detail-items-cell--product">{item.productName}</div>
                      <div className="order-detail-items-cell order-detail-items-cell--option">{item.optionName || '-'}</div>
                      <div className="order-detail-items-cell order-detail-items-cell--qty">{item.quantity}</div>
                      <div className="order-detail-items-cell order-detail-items-cell--price">{formatPrice(item.unitPrice)}</div>
                      <div className="order-detail-items-cell order-detail-items-cell--subtotal">{formatPrice(item.subtotal)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-detail-section-title">배송정보</div>
                <div className="order-detail-info-grid">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">수령인</div>
                    <div className="order-detail-info-value">{order.recipientName}</div>
                  </div>
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">연락처</div>
                    <div className="order-detail-info-value">{order.recipientPhone}</div>
                  </div>
                </div>
                <div className="order-detail-info-grid order-detail-info-grid--full">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">주소</div>
                    <div className="order-detail-info-value">
                      {order.address}{order.addressDetail ? ` ${order.addressDetail}` : ''}
                    </div>
                  </div>
                </div>
                <div className="order-detail-info-grid order-detail-info-grid--full">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">배송 요청사항</div>
                    <div className="order-detail-info-value">{order.deliveryRequest || '-'}</div>
                  </div>
                </div>
                <div className="order-detail-info-grid">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">택배사</div>
                    <div className="order-detail-info-value">{order.shippingCompany || '-'}</div>
                  </div>
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">송장번호</div>
                    <div className="order-detail-info-value">{order.trackingNumber || '-'}</div>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-detail-section-title">결제정보</div>
                <div className="order-detail-info-grid">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">상품금액</div>
                    <div className="order-detail-info-value">{formatPrice(order.totalProductPrice)}</div>
                  </div>
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">배송비</div>
                    <div className="order-detail-info-value">{formatPrice(order.shippingFee)}</div>
                  </div>
                </div>
                {(order.couponDiscountAmount > 0 || order.usedPoints > 0) && (
                  <div className="order-detail-info-grid">
                    {order.couponDiscountAmount > 0 && (
                      <div className="order-detail-info-row-item">
                        <div className="order-detail-info-label">쿠폰 할인</div>
                        <div className="order-detail-info-value">-{formatPrice(order.couponDiscountAmount)}</div>
                      </div>
                    )}
                    {order.usedPoints > 0 && (
                      <div className="order-detail-info-row-item">
                        <div className="order-detail-info-label">포인트 사용</div>
                        <div className="order-detail-info-value">-{formatPrice(order.usedPoints)}</div>
                      </div>
                    )}
                  </div>
                )}
                <div className="order-detail-info-grid">
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label">결제수단</div>
                    <div className="order-detail-info-value">{formatPaymentMethod(order.paymentMethod)}</div>
                  </div>
                  <div className="order-detail-info-row-item">
                    <div className="order-detail-info-label order-detail-info-label--highlight">최종 결제금액</div>
                    <div className="order-detail-info-value order-detail-info-value--highlight">{formatPrice(order.finalAmount)}</div>
                  </div>
                </div>
              </div>

              <div className="order-detail-section">
                <div className="order-detail-section-title">관리 메모</div>
                <div className="order-detail-memo-container">
                  <textarea
                    className="order-detail-memo-textarea"
                    value={adminMemo}
                    onChange={(e) => setAdminMemo(e.target.value)}
                    placeholder="관리자 메모를 입력하세요..."
                  />
                  <button
                    className="order-detail-memo-save-button"
                    onClick={handleSaveMemo}
                    disabled={isSavingMemo}
                  >
                    {isSavingMemo ? '저장 중...' : memoSaveSuccess ? '저장 완료!' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="order-detail-error">주문 정보를 불러올 수 없습니다.</div>
        )}
      </div>
    </>
  );
}
