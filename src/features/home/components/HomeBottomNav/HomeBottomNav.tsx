import './HomeBottomNav.css';

type NavItem = 'home' | 'category' | 'search' | 'profile';

interface HomeBottomNavProps {
  activeItem?: NavItem;
  onItemClick?: (item: NavItem) => void;
}

const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'category', label: '카테고리' },
  { id: 'search', label: '검색' },
  { id: 'profile', label: '봉크루' },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22V12H15V22"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6H21M3 12H21M3 18H21"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
      />
      <path
        d="M21 21L16.5 16.5"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
      />
      <path
        d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20"
        stroke={active ? '#3B9BD5' : 'rgba(12, 12, 12, 0.9)'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getIcon(id: NavItem, active: boolean) {
  switch (id) {
    case 'home':
      return <HomeIcon active={active} />;
    case 'category':
      return <CategoryIcon active={active} />;
    case 'search':
      return <SearchIcon active={active} />;
    case 'profile':
      return <ProfileIcon active={active} />;
  }
}

export default function HomeBottomNav({ 
  activeItem = 'home', 
  onItemClick 
}: HomeBottomNavProps) {
  return (
    <nav className="home-bottom-nav">
      <div className="home-bottom-nav__items">
        {NAV_ITEMS.map(item => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={`home-bottom-nav__item ${isActive ? 'home-bottom-nav__item--active' : ''}`}
              onClick={() => onItemClick?.(item.id)}
            >
              <span className="home-bottom-nav__icon">
                {getIcon(item.id, isActive)}
              </span>
              <span className={`home-bottom-nav__label ${isActive ? 'home-bottom-nav__label--active' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="home-bottom-nav__indicator" />
    </nav>
  );
}
