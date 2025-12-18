import { AdminLayout } from '../layouts';
import './AdminDashboardPage.css';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
}

const statCards: StatCard[] = [
  { title: '오늘 매출', value: '₩1,234,567', change: '+12.5%', changeType: 'up', icon: '💰' },
  { title: '신규 주문', value: '23건', change: '+5건', changeType: 'up', icon: '🛒' },
  { title: '신규 회원', value: '15명', change: '+3명', changeType: 'up', icon: '👤' },
  { title: '대기 중 문의', value: '8건', change: '-2건', changeType: 'down', icon: '💬' },
];

const recentOrders = [
  { id: 'ORD-001', customer: '김철수', amount: '₩89,000', status: '결제완료', date: '2024-01-15' },
  { id: 'ORD-002', customer: '이영희', amount: '₩156,000', status: '배송중', date: '2024-01-15' },
  { id: 'ORD-003', customer: '박민수', amount: '₩45,000', status: '준비중', date: '2024-01-14' },
  { id: 'ORD-004', customer: '최지영', amount: '₩234,000', status: '결제완료', date: '2024-01-14' },
  { id: 'ORD-005', customer: '정수진', amount: '₩67,000', status: '배송완료', date: '2024-01-13' },
];

export function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <section className="admin-dashboard__stats">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card">
              <div className="stat-card__icon">{card.icon}</div>
              <div className="stat-card__content">
                <h3 className="stat-card__title">{card.title}</h3>
                <p className="stat-card__value">{card.value}</p>
                <span className={`stat-card__change stat-card__change--${card.changeType}`}>
                  {card.change}
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__section-header">
            <h2 className="admin-dashboard__section-title">최근 주문</h2>
            <a href="/admin/orders" className="admin-dashboard__view-all">
              전체보기 →
            </a>
          </div>
          
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>고객명</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>주문일</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`status-badge status-badge--${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__section-header">
            <h2 className="admin-dashboard__section-title">빠른 작업</h2>
          </div>
          
          <div className="quick-actions">
            <a href="/admin/products/new" className="quick-action">
              <span className="quick-action__icon">➕</span>
              <span className="quick-action__label">상품 등록</span>
            </a>
            <a href="/admin/coupons/new" className="quick-action">
              <span className="quick-action__icon">🎟️</span>
              <span className="quick-action__label">쿠폰 생성</span>
            </a>
            <a href="/admin/banners" className="quick-action">
              <span className="quick-action__icon">🖼️</span>
              <span className="quick-action__label">배너 관리</span>
            </a>
            <a href="/admin/settings" className="quick-action">
              <span className="quick-action__icon">⚙️</span>
              <span className="quick-action__label">설정</span>
            </a>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
