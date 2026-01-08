import { CategoryCard } from '../CategoryCard';
import './CategoryCardGrid.css';

import obadaImage from '../../../../assets/image/category/obada.webp';
import fourseasonImage from '../../../../assets/image/category/fourseason.webp';
import bongcookImage from '../../../../assets/image/category/bongcook.webp';
import badameunImage from '../../../../assets/image/category/badameun.webp';

interface BrandCategory {
  id: string;
  name: string;
  subtitle: string;
  imageSrc: string;
}

const brandCategories: BrandCategory[] = [
  {
    id: 'badameun',
    name: '바담은',
    subtitle: '수산물',
    imageSrc: badameunImage,
  },
  {
    id: 'obada',
    name: '오바다',
    subtitle: '수산물',
    imageSrc: obadaImage,
  },
  {
    id: 'fourseason',
    name: '포시즌',
    subtitle: '수산물',
    imageSrc: fourseasonImage,
  },
  {
    id: 'bongcook',
    name: '봉쿡',
    subtitle: '수산물',
    imageSrc: bongcookImage,
  },
];

interface CategoryCardGridProps {
  onCardClick?: (brandId: string) => void;
}

export function CategoryCardGrid({ onCardClick }: CategoryCardGridProps) {
  return (
    <section className="category-brand-section">
      <h2 className="category-brand-section__title">봉선장's Brand</h2>
      <div className="category-card-scroll">
        <div className="category-card-scroll__inner">
          {brandCategories.map((brand) => (
            <CategoryCard
              key={brand.id}
              name={brand.name}
              subtitle={brand.subtitle}
              imageSrc={brand.imageSrc}
              onClick={() => onCardClick?.(brand.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
