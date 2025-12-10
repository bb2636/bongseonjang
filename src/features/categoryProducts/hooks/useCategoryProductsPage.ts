import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CATEGORIES, Category } from '../../category/types/category';

interface Product {
  id: number;
  name: string;
  price: number;
  discountRate: number;
  imageUrl: string;
}

export interface UseCategoryProductsPageReturn {
  activeCategory: string;
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  handleCategoryChange: (slug: string) => void;
  handleProductClick: (productId: number) => void;
  handleAddToCart: (productId: number) => void;
  handleCartClick: () => void;
  handleBack: () => void;
}

export function useCategoryProductsPage(): UseCategoryProductsPageReturn {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [activeCategory, setActiveCategory] = useState(slug || 'all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setActiveCategory(slug || 'all');
  }, [slug]);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const mappedProducts = data
            .filter((p: any) => p && p.id)
            .map((p: any) => ({
              id: p.id,
              name: p.name || '상품명 없음',
              price: p.lowestPrice || p.basePrice || 0,
              discountRate: p.discountRate || 0,
              imageUrl: p.thumbnailUrl || '',
            }));
          setProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const handleCategoryChange = (newSlug: string) => {
    setActiveCategory(newSlug);
    navigate(`/category/${newSlug}`, { replace: true });
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (productId: number) => {
    console.log('Add to cart:', productId);
  };

  const handleCartClick = () => {
    console.log('Cart clicked');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return {
    activeCategory,
    categories: CATEGORIES,
    products,
    isLoading,
    handleCategoryChange,
    handleProductClick,
    handleAddToCart,
    handleCartClick,
    handleBack,
  };
}
