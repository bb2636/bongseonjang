import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ProductCardData } from '@/components/ProductCard';
import type { SortBy } from '../types/SortTypes';

const RECENT_SEARCHES_KEY = 'recentSearches';

interface PopularSearchTerm {
  term: string;
  searchCount: number;
}

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

async function recordSearchToServer(term: string) {
  try {
    await fetch('/api/search/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ term }),
    });
  } catch (error) {
    console.error('Failed to record search:', error);
  }
}

export function useSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(loadRecentSearches);
  const [popularSearches, setPopularSearches] = useState<PopularSearchTerm[]>([]);
  const [searchResults, setSearchResults] = useState<ProductCardData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('default');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  useEffect(() => {
    saveRecentSearches(recentSearches);
  }, [recentSearches]);

  useEffect(() => {
    async function fetchPopularSearches() {
      try {
        const response = await fetch('/api/search/popular?limit=10');
        if (response.ok) {
          const data = await response.json();
          setPopularSearches(data);
        }
      } catch (error) {
        console.error('Failed to fetch popular searches:', error);
      }
    }
    fetchPopularSearches();
  }, []);

  const performSearch = useCallback(async (term: string, sort: SortBy = sortBy, isNewSearch: boolean = true) => {
    if (!term.trim()) return;

    setSearchQuery(term);
    setCurrentSearchTerm(term);
    setIsSearching(true);
    setHasSearched(true);

    if (isNewSearch) {
      const updatedRecent = [
        term,
        ...recentSearches.filter(s => s !== term)
      ].slice(0, 10);
      setRecentSearches(updatedRecent);
      recordSearchToServer(term);
    }

    try {
      const params = new URLSearchParams();
      params.set('search', term);
      params.set('sortBy', sort);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.map((p: any) => ({
          id: String(p.id),
          name: p.name || '상품명 없음',
          imageUrl: p.imageUrl || '',
          originalPrice: p.originalPrice || 0,
          discountPercent: p.discountPercent || 0,
          discountedPrice: p.discountedPrice || p.originalPrice || 0,
        })));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [recentSearches, sortBy]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    setHasSearched(false);
    setSearchResults([]);
  }, []);

  const handleSearch = useCallback(async () => {
    await performSearch(searchQuery);
  }, [searchQuery, performSearch]);

  const handleRecentSearchClick = useCallback(async (term: string) => {
    await performSearch(term);
  }, [performSearch]);

  const handlePopularSearchClick = useCallback((_term: string) => {
    // 현재 인기검색어 클릭 시 아무 동작 안함
  }, []);

  const handleSortChange = useCallback((newSort: SortBy) => {
    setSortBy(newSort);
    if (currentSearchTerm) {
      performSearch(currentSearchTerm, newSort, false);
    }
  }, [currentSearchTerm, performSearch]);

  const handleRecentSearchDelete = useCallback((term: string) => {
    setRecentSearches(prev => prev.filter(s => s !== term));
  }, []);

  const handleClearAllRecent = useCallback(() => {
    setRecentSearches([]);
  }, []);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  return {
    searchQuery,
    recentSearches,
    popularSearches,
    searchResults,
    isSearching,
    hasSearched,
    sortBy,
    onSearchChange: handleSearchChange,
    onSearchClear: handleSearchClear,
    onSearch: handleSearch,
    onRecentSearchClick: handleRecentSearchClick,
    onPopularSearchClick: handlePopularSearchClick,
    onSortChange: handleSortChange,
    onRecentSearchDelete: handleRecentSearchDelete,
    onClearAllRecent: handleClearAllRecent,
    onProductClick: handleProductClick,
  };
}

export type SearchPageState = ReturnType<typeof useSearchPage>;
