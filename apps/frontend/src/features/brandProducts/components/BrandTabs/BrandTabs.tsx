import './BrandTabs.css';

interface Brand {
  id: string;
  name: string;
}

const BRANDS: Brand[] = [
  { id: 'badameun', name: '바담은' },
  { id: 'obada', name: '온바다' },
  { id: 'fourseason', name: '포시즌' },
  { id: 'bongcook', name: '봉쿡' },
];

interface BrandTabsProps {
  activeBrandId: string;
  onBrandChange: (brandId: string) => void;
}

export function BrandTabs({ activeBrandId, onBrandChange }: BrandTabsProps) {
  return (
    <nav className="brand-tabs">
      <div className="brand-tabs__list">
        {BRANDS.map((brand) => (
          <button
            key={brand.id}
            type="button"
            className={`brand-tabs__tab ${activeBrandId === brand.id ? 'brand-tabs__tab--active' : ''}`}
            onClick={() => onBrandChange(brand.id)}
          >
            {brand.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
