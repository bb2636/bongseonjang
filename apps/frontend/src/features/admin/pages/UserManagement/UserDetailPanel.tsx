import { useState, useEffect } from 'react';
import './UserDetailPanel.css';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  birthDate: string | null;
  gender: string | null;
  membershipGrade: string;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  orderCount: number;
  defaultAddress: string | null;
}

interface OrderItem {
  id: string;
  orderNumber: string;
  status: string;
  finalAmount: number;
  createdAt: string;
  productSummary: string;
}

interface InquiryItem {
  id: number;
  inquiryType: string;
  productId: string | null;
  productName: string | null;
  question: string;
  answer: string | null;
  isAnswered: boolean;
  createdAt: string;
  answeredAt: string | null;
}

interface UserDetailPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'basic' | 'orders' | 'inquiries';

export function UserDetailPanel({ userId, isOpen, onClose }: UserDetailPanelProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  useEffect(() => {
    if (isOpen && userId) {
      setActiveTab('basic');
      fetchUserDetail();
      fetchOrders();
      fetchInquiries();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Failed to fetch user detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/orders`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/inquiries`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.items);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const formatPhone = (phone: string | null): string => {
    if (!phone) return '-';
    return phone;
  };

  const formatGender = (gender: string | null): string => {
    if (!gender) return '-';
    if (gender === 'male' || gender === 'M') return '남';
    if (gender === 'female' || gender === 'F') return '여';
    return gender;
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const formatOrderStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: '결제대기',
      paid: '결제완료',
      preparing: '상품준비중',
      shipping: '배송중',
      delivered: '배송완료',
      cancelled: '주문취소',
      refund_requested: '환불요청',
      refunded: '환불완료',
    };
    return statusMap[status] || status;
  };

  const formatInquiryType = (type: string): string => {
    const typeMap: Record<string, string> = {
      product: '상품',
      shipping: '배송',
      exchange_return: '교환/반품',
      refund: '환불',
      other: '기타',
    };
    return typeMap[type] || type;
  };

  const handleSuspendAccount = () => {
    console.log('Suspend account:', userId);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="user-detail-overlay" onClick={onClose} />
      <div className="user-detail-panel">
        <div className="user-detail-header">
          <button className="user-detail-back-button" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#292929" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="user-detail-back-text">목록으로</span>
        </div>

        {isLoading ? (
          <div className="user-detail-loading">로딩 중...</div>
        ) : user ? (
          <>
            <div className="user-detail-summary">
              <div className="user-detail-summary-content">
                <div className="user-detail-name">{user.name}</div>
                <div className="user-detail-info-row">
                  <span className="user-detail-info-item">{formatPhone(user.phone)}</span>
                  <span className="user-detail-info-dot" />
                  <span className="user-detail-info-item">{formatDate(user.createdAt)}</span>
                  <span className="user-detail-info-dot" />
                  <span className="user-detail-info-item">{formatGender(user.gender)}</span>
                </div>
              </div>
            </div>

            <div className="user-detail-tabs">
              <button 
                className={`user-detail-tab ${activeTab === 'basic' ? 'active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                기본 정보
              </button>
              <button 
                className={`user-detail-tab ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                주문내역
              </button>
              <button 
                className={`user-detail-tab ${activeTab === 'inquiries' ? 'active' : ''}`}
                onClick={() => setActiveTab('inquiries')}
              >
                상품 문의
              </button>
            </div>

            <div className="user-detail-content">
              {activeTab === 'basic' && (
                <div className="user-detail-basic-info">
                  <div className="user-detail-section-title">기본정보</div>
                  <div className="user-detail-info-grid">
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">성함</div>
                      <div className="user-detail-info-value">{user.name}</div>
                    </div>
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">생년월일</div>
                      <div className="user-detail-info-value">{formatDate(user.birthDate)}</div>
                    </div>
                  </div>
                  <div className="user-detail-info-grid">
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">성별</div>
                      <div className="user-detail-info-value">{formatGender(user.gender)}</div>
                    </div>
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">이메일 주소</div>
                      <div className="user-detail-info-value">{user.email}</div>
                    </div>
                  </div>
                  <div className="user-detail-info-grid">
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">휴대폰</div>
                      <div className="user-detail-info-value">{formatPhone(user.phone)}</div>
                    </div>
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">가입일</div>
                      <div className="user-detail-info-value">{formatDate(user.createdAt)}</div>
                    </div>
                  </div>
                  <div className="user-detail-info-grid">
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">등급</div>
                      <div className="user-detail-info-value">
                        <span className="user-detail-grade-badge">{user.membershipGrade || '일반'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="user-detail-info-grid user-detail-info-grid--full">
                    <div className="user-detail-info-row-item">
                      <div className="user-detail-info-label">기본 배송지</div>
                      <div className="user-detail-info-value">{user.defaultAddress || '-'}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="user-detail-orders">
                  <div className="user-detail-section-title">주문내역</div>
                  {ordersLoading ? (
                    <div className="user-detail-empty">로딩 중...</div>
                  ) : orders.length === 0 ? (
                    <div className="user-detail-empty">주문 내역이 없습니다.</div>
                  ) : (
                    <div className="user-detail-order-table">
                      <div className="user-detail-order-table-header">
                        <div className="user-detail-order-table-cell user-detail-order-table-cell--order-number">주문번호</div>
                        <div className="user-detail-order-table-cell user-detail-order-table-cell--order-date">주문일</div>
                        <div className="user-detail-order-table-cell user-detail-order-table-cell--product-summary">상품 요약</div>
                        <div className="user-detail-order-table-cell user-detail-order-table-cell--amount">결제 금액</div>
                        <div className="user-detail-order-table-cell user-detail-order-table-cell--status">상태</div>
                      </div>
                      {orders.map((order) => (
                        <div key={order.id} className="user-detail-order-table-row">
                          <div className="user-detail-order-table-cell user-detail-order-table-cell--order-number">{order.orderNumber}</div>
                          <div className="user-detail-order-table-cell user-detail-order-table-cell--order-date">{formatDate(order.createdAt)}</div>
                          <div className="user-detail-order-table-cell user-detail-order-table-cell--product-summary">{order.productSummary}</div>
                          <div className="user-detail-order-table-cell user-detail-order-table-cell--amount">{formatPrice(order.finalAmount)}</div>
                          <div className="user-detail-order-table-cell user-detail-order-table-cell--status">
                            <span className={`user-detail-order-status-badge user-detail-order-status-badge--${order.status}`}>
                              {formatOrderStatus(order.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inquiries' && (
                <div className="user-detail-inquiries">
                  <div className="user-detail-section-title">상품 문의</div>
                  {inquiriesLoading ? (
                    <div className="user-detail-empty">로딩 중...</div>
                  ) : inquiries.length === 0 ? (
                    <div className="user-detail-empty">상품 문의가 없습니다.</div>
                  ) : (
                    <div className="user-detail-list">
                      {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="user-detail-inquiry-item">
                          <div className="user-detail-inquiry-header">
                            <span className="user-detail-inquiry-type">{formatInquiryType(inquiry.inquiryType)}</span>
                            <span className={`user-detail-inquiry-status ${inquiry.isAnswered ? 'user-detail-inquiry-status--answered' : ''}`}>
                              {inquiry.isAnswered ? '답변완료' : '답변대기'}
                            </span>
                          </div>
                          {inquiry.productName && (
                            <div className="user-detail-inquiry-product">{inquiry.productName}</div>
                          )}
                          <div className="user-detail-inquiry-question">{inquiry.question}</div>
                          <div className="user-detail-inquiry-date">{formatDate(inquiry.createdAt)}</div>
                          {inquiry.answer && (
                            <div className="user-detail-inquiry-answer">
                              <div className="user-detail-inquiry-answer-label">답변</div>
                              <div className="user-detail-inquiry-answer-text">{inquiry.answer}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="user-detail-error">사용자 정보를 불러올 수 없습니다.</div>
        )}

        <div className="user-detail-footer">
          <button className="user-detail-suspend-button" onClick={handleSuspendAccount}>
            계정 정지
          </button>
        </div>
      </div>
    </>
  );
}
