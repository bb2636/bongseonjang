import { useState, useEffect, useCallback } from 'react';

export interface AdminProduct {
  id: string;
  name: string;
  categoryName: string;
  basePrice: number;
  lowestPrice: number;
  optionCount: number;
  optionSummary: string;
  stockQuantity: number;
  isExposed: boolean;
  exposureCategories: string[];
  thumbnailUrl: string;
  createdAt: string;
}

interface ProductListResponse {
  items: AdminProduct[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useProductManagement() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error('상품 목록을 불러오는데 실패했습니다');
      }

      const data: ProductListResponse = await response.json();
      setProducts(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleAddProduct = () => {
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    fetchProducts();
  };

  const handleViewProduct = (product: AdminProduct) => {
    console.log('View product:', product.id);
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString();
  };

  const getExposureLabel = (product: AdminProduct): string => {
    if (!product.isExposed || product.exposureCategories.length === 0) {
      return '노출';
    }
    if (product.exposureCategories.length === 1) {
      return product.exposureCategories[0];
    }
    return `${product.exposureCategories[0]} 외 ${product.exposureCategories.length - 1}`;
  };

  return {
    products,
    totalCount,
    isLoading,
    error,
    searchQuery,
    isFormDialogOpen,
    onSearchChange: handleSearchChange,
    onAddProduct: handleAddProduct,
    onCloseFormDialog: handleCloseFormDialog,
    onFormSuccess: handleFormSuccess,
    onViewProduct: handleViewProduct,
    formatPrice,
    getExposureLabel,
  };
}
