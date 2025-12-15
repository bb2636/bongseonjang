import { Link, useLocation } from 'react-router-dom';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

interface MenuItem {
  path: string;
  label: string;
}

const menuItems: MenuItem[] = [
  { path: '/admin/users', label: '사용자 관리' },
  { path: '/admin/orders', label: '주문관리' },
  { path: '/admin/products', label: '상품관리' },
  { path: '/admin/coupons', label: '쿠폰관리' },
  { path: '/admin/banners', label: '배너관리' },
  { path: '/admin/support', label: '고객센터 관리' },
  { path: '/admin/terms', label: '약관 관리' },
];

const pageInfo: Record<string, { title: string; description: string }> = {
  '/admin': { title: '대시보드', description: '전체 현황을 한눈에 확인합니다' },
  '/admin/users': { title: '사용자 관리', description: '가입된 사용자의 정보와 현황을 관리합니다' },
  '/admin/orders': { title: '주문관리', description: '주문 내역을 확인하고 관리합니다' },
  '/admin/products': { title: '상품관리', description: '상품 정보를 등록하고 관리합니다' },
  '/admin/coupons': { title: '쿠폰관리', description: '쿠폰을 생성하고 관리합니다' },
  '/admin/banners': { title: '배너관리', description: '메인 배너 및 이벤트 배너를 관리합니다' },
  '/admin/support': { title: '고객센터 관리', description: '고객 문의를 확인하고 답변합니다' },
  '/admin/terms': { title: '약관 관리', description: '서비스 이용약관을 관리합니다' },
  '/admin/reviews': { title: '리뷰 관리', description: '상품 리뷰를 관리합니다' },
  '/admin/categories': { title: '카테고리 관리', description: '상품 카테고리를 관리합니다' },
  '/admin/settings': { title: '설정', description: '사이트 설정을 관리합니다' },
};

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const currentPageInfo = pageInfo[location.pathname] || pageInfo['/admin'];
  const pageTitle = title || currentPageInfo.title;
  const pageDescription = description || currentPageInfo.description;

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header__inner">
          <Link to="/admin" className="admin-header__logo">
            <span className="admin-header__logo-text">봉선장</span>
          </Link>
          
          <nav className="admin-header__nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-header__nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-page-header">
          <h1 className="admin-page-header__title">{pageTitle}</h1>
          <p className="admin-page-header__description">{pageDescription}</p>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
