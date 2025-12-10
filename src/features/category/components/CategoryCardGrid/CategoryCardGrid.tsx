import { CategoryCard } from '../CategoryCard';
import './CategoryCardGrid.css';

import obadaImage from '../../../../assets/image/category/obada.svg';
import fourseasonImage from '../../../../assets/image/category/fourseason.svg';
import bongcookImage from '../../../../assets/image/category/bongcook.svg';
import badameunImage from '../../../../assets/image/category/badameun.svg';

interface BrandCategory {
  id: string;
  name: string;
  subtitle: string;
  imageSrc: string;
  logoSrc: string;
}

const brandCategories: BrandCategory[] = [
  {
    id: 'obada',
    name: '오바다',
    subtitle: '수산물',
    imageSrc: obadaImage,
    logoSrc: obadaImage,
  },
  {
    id: 'fourseason',
    name: '포시즌',
    subtitle: '수산물',
    imageSrc: fourseasonImage,
    logoSrc: fourseasonImage,
  },
  {
    id: 'bongcook',
    name: '봉쿡',
    subtitle: '수산물',
    imageSrc: bongcookImage,
    logoSrc: bongcookImage,
  },
  {
    id: 'badameun',
    name: '바담은',
    subtitle: '절임류',
    imageSrc: badameunImage,
    logoSrc: badameunImage,
  },
];

interface CategoryCardGridProps {
  onCardClick?: (brandId: string) => void;
}

export function CategoryCardGrid({ onCardClick }: CategoryCardGridProps) {
  return (
    <div className="category-card-grid">
      {brandCategories.map((brand) => (
        <CategoryCard
          key={brand.id}
          name={brand.name}
          subtitle={brand.subtitle}
          imageSrc={brand.imageSrc}
          logoSrc={brand.logoSrc}
          onClick={() => onCardClick?.(brand.id)}
        />
      ))}
    </div>
  );
}
