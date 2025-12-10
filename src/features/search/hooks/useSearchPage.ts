import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductCardData } from '@/components/ProductCard';

const RECENT_SEARCHES_KEY = 'recentSearches';

function loadRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(searches: string[]) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    console.error('Failed to save recent searches');
  }
}

export function useSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
  const [searchResults, setSearchResults] = useState<ProductCardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    saveRecentSearches(recentSearches);
  }, [recentSearches]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 10);
    setRecentSearches(updatedRecent);

    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.map((p: any) => ({
          id: String(p.id),
          name: p.name || '상품명 없음',
          price: p.lowestPrice || p.basePrice || 0,
          originalPrice: p.basePrice || undefined,
          discountRate: p.discountRate || 0,
          imageUrl: p.thumbnailUrl || '',
          isFavorite: false,
        })));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, recentSearches]);

  const handleRecentSearchClick = useCallback((term: string) => {
    setSearchQuery(term);
  }, []);

  const handleRecentSearchDelete = useCallback((term: string) => {
    setRecentSearches(prev => prev.filter(s => s !== term));
  }, []);

  const handleClearAllRecent = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleAddToCart = useCallback((productId: string) => {
    console.log('Add to cart:', productId);
  }, []);

  const handleToggleFavorite = useCallback((productId: string) => {
    console.log('Toggle favorite:', productId);
  }, []);

  return {
    searchQuery,
    recentSearches,
    searchResults,
    isSearching,
    hasSearched,
    onSearchChange: handleSearchChange,
    onSearchClear: handleSearchClear,
    onSearch: handleSearch,
    onRecentSearchClick: handleRecentSearchClick,
    onRecentSearchDelete: handleRecentSearchDelete,
    onClearAllRecent: handleClearAllRecent,
    onCartClick: handleCartClick,
    onLogoClick: handleLogoClick,
    onProductClick: handleProductClick,
    onAddToCart: handleAddToCart,
    onToggleFavorite: handleToggleFavorite,
  };
}

export type SearchPageState = ReturnType<typeof useSearchPage>;
