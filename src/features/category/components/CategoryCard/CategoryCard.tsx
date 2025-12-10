import './CategoryCard.css';

interface CategoryCardProps {
  name: string;
  subtitle: string;
  imageSrc: string;
  logoSrc: string;
  onClick?: () => void;
}

export function CategoryCard({ 
  name, 
  subtitle, 
  imageSrc, 
  logoSrc,
  onClick 
}: CategoryCardProps) {
  return (
    <div className="category-card" onClick={onClick}>
      <div className="category-card__image-container">
        <img 
          src={imageSrc} 
          alt={name} 
          className="category-card__image" 
        />
        <div className="category-card__gradient" />
        <img 
          src={logoSrc} 
          alt={`${name} 로고`} 
          className="category-card__logo" 
        />
      </div>
      <div className="category-card__info">
        <span className="category-card__name">{name}</span>
        <span className="category-card__subtitle">{subtitle}</span>
      </div>
    </div>
  );
}
