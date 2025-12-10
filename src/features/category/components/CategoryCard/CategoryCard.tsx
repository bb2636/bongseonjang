import './CategoryCard.css';

interface CategoryCardProps {
  name: string;
  subtitle: string;
  imageSrc: string;
  onClick?: () => void;
}

export function CategoryCard({ 
  name, 
  subtitle, 
  imageSrc, 
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
        <span className="category-card__brand-text">{name}</span>
      </div>
      <div className="category-card__info">
        <span className="category-card__name">{name}</span>
        <span className="category-card__subtitle">{subtitle}</span>
      </div>
    </div>
  );
}
