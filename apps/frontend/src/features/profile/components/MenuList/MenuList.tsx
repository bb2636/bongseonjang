import { MenuSection } from '../../types/profile';
import './MenuList.css';

interface MenuListProps {
  sections: MenuSection[];
  onItemClick: (path: string) => void;
  onLogout?: () => void;
}

function getIconPath(iconName: string): JSX.Element {
  switch (iconName) {
    case 'contract':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M4 5H16M4 8H12M4 11H16M4 14H10" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'reviews':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.81 18L10 15.27L5.19 18L6 12.14L2 8.27L7.91 7.26L10 2Z" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'support_agent':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 12C12.21 12 14 10.21 14 8V6C14 3.79 12.21 2 10 2C7.79 2 6 3.79 6 6V8C6 10.21 7.79 12 10 12Z" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5"/>
          <path d="M4 18V16C4 14.9 4.9 14 6 14H14C15.1 14 16 14.9 16 16V18" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'contact_support':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5"/>
          <path d="M10 14V10M10 6H10.01" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'campaign':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M16 4L4 8V12L16 16V4Z" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 10H2" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    case 'sticky_note_2':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12 2H4C2.9 2 2 2.9 2 4V16C2 17.1 2.9 18 4 18H16C17.1 18 18 17.1 18 16V8L12 2Z" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2V8H18" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="rgba(12, 12, 12, 0.9)" strokeWidth="1.5"/>
        </svg>
      );
  }
}

export default function MenuList({ sections, onItemClick, onLogout }: MenuListProps) {
  const handleItemClick = (item: MenuSection['items'][0]) => {
    if (item.action === 'logout') {
      onLogout?.();
    } else if (item.path) {
      onItemClick(item.path);
    }
  };

  return (
    <nav className="menu-list">
      {sections.map((section, index) => (
        <div key={section.title || `section-${index}`} className="menu-list__section">
          {section.title && (
            <h4 className="menu-list__section-title">{section.title}</h4>
          )}
          <ul className="menu-list__items">
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="menu-list__item"
                  onClick={() => handleItemClick(item)}
                >
                  {item.icon && (
                    <span className="menu-list__item-icon">
                      {getIconPath(item.icon)}
                    </span>
                  )}
                  <span
                    className="menu-list__item-label"
                    style={item.color ? { color: item.color } : undefined}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {index < sections.length - 1 && (
            <div className="menu-list__divider" />
          )}
        </div>
      ))}
    </nav>
  );
}
