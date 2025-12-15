import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { path: '/admin', label: '대시보드', icon: '📊' },
  { path: '/admin/products', label: '상품 관리', icon: '📦' },
  { path: '/admin/orders', label: '주문 관리', icon: '🛒' },
  { path: '/admin/users', label: '회원 관리', icon: '👥' },
  { path: '/admin/reviews', label: '리뷰 관리', icon: '⭐' },
  { path: '/admin/coupons', label: '쿠폰 관리', icon: '🎟️' },
  { path: '/admin/banners', label: '배너 관리', icon: '🖼️' },
  { path: '/admin/categories', label: '카테고리 관리', icon: '📁' },
  { path: '/admin/settings', label: '설정', icon: '⚙️' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar__header">
          <Link to="/admin" className="admin-sidebar__logo">
            {isSidebarCollapsed ? '🏠' : '관리자'}
          </Link>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="admin-sidebar__label">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/" className="admin-sidebar__item">
            <span className="admin-sidebar__icon">🏪</span>
            {!isSidebarCollapsed && (
              <span className="admin-sidebar__label">사이트 보기</span>
            )}
          </Link>
          <button className="admin-sidebar__item" onClick={handleLogout}>
            <span className="admin-sidebar__icon">🚪</span>
            {!isSidebarCollapsed && (
              <span className="admin-sidebar__label">로그아웃</span>
            )}
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header__title">
            {menuItems.find((item) => isActive(item.path))?.label || '관리자'}
          </h1>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
