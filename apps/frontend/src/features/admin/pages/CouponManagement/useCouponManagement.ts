import { useState, useEffect, useCallback } from 'react';

export type DiscountType = 'fixed' | 'rate' | 'shipping';
export type DiscountFilter = 'all' | 'fixed' | 'rate' | 'shipping';

export interface AdminCoupon {
  id: number;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minOrderAmount: number;
  targetType: 'all' | 'category';
  targetCategories: string[];
  issueType: 'all' | 'new' | 'grade';
  issueGrades: string[];
  validityType: 'fixed' | 'afterIssue' | 'unlimited';
  validFrom: string | null;
  validTo: string | null;
  validDays: number | null;
  usageLimitEnabled: boolean;
  maxUsagePerUser: number | null;
  allowMultipleUse: boolean;
  isActive: boolean;
  issuedCount: number;
  usedCount: number;
  createdAt: string;
}

interface CouponListResponse {
  coupons: AdminCoupon[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useCouponManagement() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilter>('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewingCoupon, setViewingCoupon] = useState<AdminCoupon | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCouponId, setDeletingCouponId] = useState<number | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (discountFilter !== 'all') params.append('discountType', discountFilter);
      
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/coupons?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('쿠폰 목록을 불러오는데 실패했습니다');
      }
      const data: CouponListResponse = await response.json();
      setCoupons(data.coupons);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      setCoupons([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, discountFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((filter: DiscountFilter) => {
    setDiscountFilter(filter);
  }, []);

  const handleAddCoupon = useCallback(() => {
    setEditingCoupon(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleEditCoupon = useCallback((coupon: AdminCoupon) => {
    setEditingCoupon(coupon);
    setIsFormDialogOpen(true);
  }, []);

  const handleViewCoupon = useCallback((coupon: AdminCoupon) => {
    setViewingCoupon(coupon);
    setIsDetailDialogOpen(true);
  }, []);

  const handleCloseDetailDialog = useCallback(() => {
    setIsDetailDialogOpen(false);
    setViewingCoupon(null);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setIsFormDialogOpen(false);
    setEditingCoupon(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchCoupons();
    handleCloseFormDialog();
  }, [fetchCoupons, handleCloseFormDialog]);

  const handleToggleStatus = useCallback(async (couponId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/coupons/${couponId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('상태 변경에 실패했습니다');
      }
      fetchCoupons();
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
    }
  }, [fetchCoupons]);

  const handleDeleteCoupon = useCallback((couponId: number) => {
    setDeletingCouponId(couponId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setDeletingCouponId(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingCouponId) return;
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/coupons/${deletingCouponId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('쿠폰 삭제에 실패했습니다');
      }
      setIsDeleteDialogOpen(false);
      setDeletingCouponId(null);
      setSnackbarMessage('쿠폰이 삭제되었습니다');
      setIsSnackbarOpen(true);
      fetchCoupons();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
    }
  }, [deletingCouponId, fetchCoupons]);

  const handleCloseSnackbar = useCallback(() => {
    setIsSnackbarOpen(false);
  }, []);

  const getDiscountTypeLabel = useCallback((type: DiscountType): string => {
    switch (type) {
      case 'fixed':
        return '정액 할인';
      case 'rate':
        return '정률 할인';
      case 'shipping':
        return '배송비 할인';
      default:
        return '알 수 없음';
    }
  }, []);

  const getDiscountValueLabel = useCallback((coupon: AdminCoupon): string => {
    switch (coupon.discountType) {
      case 'fixed':
        return `${coupon.discountValue.toLocaleString()}원`;
      case 'rate':
        return `${coupon.discountValue}%`;
      case 'shipping':
        return coupon.discountValue === 0 ? '무료 배송' : `${coupon.discountValue.toLocaleString()}원`;
      default:
        return '-';
    }
  }, []);

  const getTargetLabel = useCallback((coupon: AdminCoupon): string => {
    return coupon.targetType === 'all' ? '전체 상품' : '특정 카테고리';
  }, []);

  const getConditionLabel = useCallback((coupon: AdminCoupon): string => {
    if (coupon.minOrderAmount === 0) return '조건 없음';
    return `최소 ${coupon.minOrderAmount.toLocaleString()}원 이상`;
  }, []);

  const getPeriodLabel = useCallback((coupon: AdminCoupon): string => {
    if (coupon.validityType === 'unlimited') return '상시 발급';
    if (coupon.validityType === 'afterIssue' && coupon.validDays) {
      return `발급 후 ${coupon.validDays}일`;
    }
    if (coupon.validFrom && coupon.validTo) {
      const from = new Date(coupon.validFrom).toLocaleDateString('ko-KR');
      const to = new Date(coupon.validTo).toLocaleDateString('ko-KR');
      return `${from} ~ ${to}`;
    }
    return '-';
  }, []);

  return {
    coupons,
    totalCount,
    isLoading,
    error,
    searchQuery,
    discountFilter,
    isFormDialogOpen,
    editingCoupon,
    isDetailDialogOpen,
    viewingCoupon,
    isDeleteDialogOpen,
    isSnackbarOpen,
    snackbarMessage,
    handleSearchChange,
    handleFilterChange,
    handleAddCoupon,
    handleEditCoupon,
    handleViewCoupon,
    handleCloseFormDialog,
    handleCloseDetailDialog,
    handleFormSuccess,
    handleToggleStatus,
    handleDeleteCoupon,
    handleCancelDelete,
    handleConfirmDelete,
    handleCloseSnackbar,
    getDiscountTypeLabel,
    getDiscountValueLabel,
    getTargetLabel,
    getConditionLabel,
    getPeriodLabel,
  };
}
