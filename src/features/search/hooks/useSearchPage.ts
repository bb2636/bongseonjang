import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SearchResult {
  id: number;
  name: string;
  price: number;
  discountRate: number;
  imageUrl: string;
}

export function useSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    '오징어',
    '새우',
    '갈치'
  ]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
          id: p.id,
          name: p.name || '상품명 없음',
          price: p.lowestPrice || p.basePrice || 0,
          discountRate: p.discountRate || 0,
          imageUrl: p.thumbnailUrl || '',
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
    setTimeout(() => {
      setSearchQuery(term);
    }, 0);
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

  const handleProductClick = useCallback((productId: number) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleAddToCart = useCallback((productId: number) => {
    console.log('Add to cart:', productId);
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
    onProductClick: handleProductClick,
    onAddToCart: handleAddToCart,
  };
}

export type SearchPageState = ReturnType<typeof useSearchPage>;
