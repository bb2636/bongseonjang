import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMyInquiries } from '../api/myInquiriesApi';
import type { InquiryType, SortOrder, MyInquiry } from '../types/myInquiry';

const ITEMS_PER_PAGE = 20;

export function useMyInquiriesPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<InquiryType>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [page, setPage] = useState(1);
  const [allInquiries, setAllInquiries] = useState<MyInquiry[]>([]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['myInquiries', selectedType, sortOrder, page],
    queryFn: () => fetchMyInquiries({ page, type: selectedType, sort: sortOrder, limit: ITEMS_PER_PAGE }),
  });

  const inquiries = page === 1 ? (data?.inquiries ?? []) : allInquiries;
  const total = data?.total ?? 0;
  const hasMore = inquiries.length < total;

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleTypeChange = useCallback((type: InquiryType) => {
    setSelectedType(type);
    setPage(1);
    setAllInquiries([]);
  }, []);

  const handleSortChange = useCallback((sort: SortOrder) => {
    setSortOrder(sort);
    setPage(1);
    setAllInquiries([]);
  }, []);

  const handleProductClick = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && hasMore && data?.inquiries) {
      setAllInquiries((prev) => [...prev, ...(prev.length === 0 ? data.inquiries : [])]);
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore, data?.inquiries]);

  const displayInquiries = page === 1 ? (data?.inquiries ?? []) : allInquiries.concat(data?.inquiries ?? []);

  return {
    inquiries: displayInquiries,
    total,
    hasMore,
    isLoading: isLoading && page === 1,
    isLoadingMore: isFetching && page > 1,
    error: error ? '문의 목록을 불러오는데 실패했습니다.' : null,
    selectedType,
    sortOrder,
    onBack: handleBack,
    onCartClick: handleCartClick,
    onTypeChange: handleTypeChange,
    onSortChange: handleSortChange,
    onProductClick: handleProductClick,
    onLoadMore: handleLoadMore,
  };
}
