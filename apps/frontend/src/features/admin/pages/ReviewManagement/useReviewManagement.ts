import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/shared/config/apiConfig';

export interface ReviewImage {
  id: string;
  imageUrl: string;
}

export interface AdminReview {
  id: string;
  productId: string;
  productName: string | null;
  productThumbnail: string | null;
  userId: string;
  userName: string | null;
  rating: number;
  content: string;
  images: ReviewImage[];
  createdAt: string;
}

interface ReviewListResponse {
  items: AdminReview[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useReviewManagement() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (ratingFilter !== 'all') {
        params.append('rating', ratingFilter);
      }

      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/reviews?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('리뷰 목록을 불러오는데 실패했습니다');
      }

      const data: ReviewListResponse = await response.json();
      setReviews(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleRatingFilterChange = (rating: string) => {
    setRatingFilter(rating);
    setPage(1);
  };

  const handleViewReview = (review: AdminReview) => {
    setSelectedReviewId(review.id);
    setIsDetailPanelOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setIsDetailPanelOpen(false);
    setSelectedReviewId(null);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        await fetchReviews();
        if (selectedReviewId === reviewId) {
          handleCloseDetailPanel();
        }
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return {
    reviews,
    totalCount,
    isLoading,
    error,
    searchQuery,
    ratingFilter,
    onSearchChange: handleSearchChange,
    onRatingFilterChange: handleRatingFilterChange,
    onViewReview: handleViewReview,
    onDeleteReview: handleDeleteReview,
    formatDate,
    selectedReviewId,
    isDetailPanelOpen,
    onCloseDetailPanel: handleCloseDetailPanel,
    refreshReviews: fetchReviews,
  };
}
