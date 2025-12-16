import { useLocation } from 'react-router-dom';
import { AdminLayout } from '../layouts';
import './AdminPlaceholderPage.css';

const pageNames: Record<string, string> = {
  '/admin/products': '상품 관리',
  '/admin/orders': '주문 관리',
  '/admin/users': '회원 관리',
  '/admin/reviews': '리뷰 관리',
  '/admin/coupons': '쿠폰 관리',
  '/admin/banners': '배너 관리',
  '/admin/categories': '카테고리 관리',
  '/admin/settings': '설정',
};

export function AdminPlaceholderPage() {
  const location = useLocation();
  const pageName = pageNames[location.pathname] || '관리자 페이지';

  return (
    <AdminLayout>
      <div className="admin-placeholder">
        <div className="admin-placeholder__icon">🚧</div>
        <h2 className="admin-placeholder__title">{pageName}</h2>
        <p className="admin-placeholder__description">
          이 페이지는 준비 중입니다.
        </p>
        <p className="admin-placeholder__sub">
          곧 업데이트될 예정입니다.
        </p>
      </div>
    </AdminLayout>
  );
}
