import { useState, useEffect, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { API_BASE_URL } from '@/shared/config/apiConfig';

export interface BannerPosition {
  id: number;
  code: string;
  name: string;
  sortNo: number;
  isActive: boolean;
}

export interface Banner {
  id: number;
  bannerPositionId: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  description: string | null;
  sortNo: number;
  isActive: boolean;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  position?: BannerPosition;
}

export interface BannerTab {
  code: string;
  name: string;
}

const BANNER_TABS: BannerTab[] = [
  { code: 'HOME_HERO', name: '홈/히어로' },
  { code: 'HOME_MIDDLE', name: '홈/중간' },
  { code: 'HOME_BOTTOM', name: '홈/하단' },
  { code: 'HOME_EVENT', name: '홈/이벤트' },
  { code: 'MYPAGE', name: '마이페이지' },
];

const REORDER_ERROR_TIMEOUT_MS = 5000;

export function useBannerManagement() {
  const [activeTab, setActiveTab] = useState<string>('HOME_HERO');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [positions, setPositions] = useState<BannerPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/banner-positions`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('배너 위치 목록을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setPositions(data);
    } catch (err) {
      console.error('Failed to fetch banner positions:', err);
    }
  }, []);

  const fetchBanners = useCallback(async (positionCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/banners?position=${positionCode}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        throw new Error('배너 목록을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setBanners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      setBanners([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  useEffect(() => {
    fetchBanners(activeTab);
  }, [activeTab, fetchBanners]);

  const handleTabChange = useCallback((tabCode: string) => {
    setActiveTab(tabCode);
    setReorderError(null);
  }, []);

  const handleAddBanner = useCallback(() => {
    setEditingBanner(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setIsFormDialogOpen(false);
    setEditingBanner(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchBanners(activeTab);
    setEditingBanner(null);
  }, [activeTab, fetchBanners]);

  const handleEditBanner = useCallback((bannerId: number) => {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
      setEditingBanner(banner);
      setIsFormDialogOpen(true);
    }
  }, [banners]);

  const handleReorderBanners = useCallback(async (activeId: number, overId: number) => {
    const oldIndex = banners.findIndex(b => b.id === activeId);
    const newIndex = banners.findIndex(b => b.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const position = positions.find(p => p.code === activeTab);
    if (!position) {
      setReorderError('배너 위치 정보를 찾을 수 없습니다');
      return;
    }

    setReorderError(null);
    const reorderedBanners = arrayMove(banners, oldIndex, newIndex);
    setBanners(reorderedBanners);

    const bannerIds = reorderedBanners.map(b => b.id);

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/banners/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ bannerIds }),
      });

      if (!response.ok) {
        throw new Error('순서 변경에 실패했습니다');
      }
    } catch (err) {
      console.error('Failed to reorder banners:', err);
      try {
        const refetchToken = sessionStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE_URL}/admin/banners?position=${activeTab}`, {
          headers: {
            ...(refetchToken ? { Authorization: `Bearer ${refetchToken}` } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setBanners(data);
        }
      } catch (refetchErr) {
        console.error('Failed to refetch banners:', refetchErr);
      }
      setReorderError('순서 변경에 실패했습니다. 다시 시도해주세요.');
      setTimeout(() => setReorderError(null), REORDER_ERROR_TIMEOUT_MS);
    }
  }, [banners, positions, activeTab]);

  const handleDismissReorderError = useCallback(() => {
    setReorderError(null);
  }, []);

  const getPositionName = useCallback((positionCode: string): string => {
    const position = positions.find(p => p.code === positionCode);
    return position?.name || positionCode;
  }, [positions]);

  const filteredBanners = banners;
  const totalCount = filteredBanners.length;

  return {
    tabs: BANNER_TABS,
    activeTab,
    banners: filteredBanners,
    positions,
    totalCount,
    isLoading,
    error,
    reorderError,
    isFormDialogOpen,
    editingBanner,
    handleTabChange,
    handleAddBanner,
    handleEditBanner,
    handleReorderBanners,
    handleDismissReorderError,
    handleCloseFormDialog,
    handleFormSuccess,
    getPositionName,
  };
}
