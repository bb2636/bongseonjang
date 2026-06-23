import { useState, useCallback, useEffect } from 'react';
import { BannerPosition, Banner } from './useBannerManagement';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import { toCategorySlug } from '@/shared/utils/categorySlug';

export type LinkType = 'internal' | 'external' | 'category' | 'none';

const CATEGORY_LINK_PREFIX = '/category/';

interface CategoryOption {
  value: string;
  label: string;
}

interface ApiCategory {
  id: string;
  name: string;
}

export interface BannerFormData {
  title: string;
  positionCode: string;
  imageUrl: string;
  linkType: LinkType;
  linkUrl: string;
  isActive: boolean;
  description: string;
  startDate: string;
  endDate: string;
}

function determineLinkType(linkUrl: string | null): LinkType {
  if (!linkUrl) return 'none';
  if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) return 'external';
  if (linkUrl.startsWith(CATEGORY_LINK_PREFIX)) return 'category';
  return 'internal';
}

function formatDateForInput(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

function createInitialFormData(defaultPositionCode: string): BannerFormData {
  return {
    title: '',
    positionCode: defaultPositionCode,
    imageUrl: '',
    linkType: 'internal',
    linkUrl: '',
    isActive: true,
    description: '',
    startDate: '',
    endDate: '',
  };
}

export function useBannerForm(
  positions: BannerPosition[], 
  defaultPositionCode: string = 'HOME_HERO',
  editingBanner: Banner | null = null
) {
  const [formData, setFormData] = useState<BannerFormData>(() => createInitialFormData(defaultPositionCode));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/categories`);
        if (!response.ok) return;
        const categories: ApiCategory[] = await response.json();
        setCategoryOptions(
          categories.map((category) => ({
            value: toCategorySlug(category.name),
            label: category.name,
          }))
        );
      } catch (err) {
        console.error('Failed to fetch categories for banner link:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingBanner) {
      const position = positions.find(p => p.id === editingBanner.bannerPositionId);
      setFormData({
        title: editingBanner.title || '',
        positionCode: position?.code || defaultPositionCode,
        imageUrl: editingBanner.imageUrl,
        linkType: determineLinkType(editingBanner.linkUrl),
        linkUrl: editingBanner.linkUrl || '',
        isActive: editingBanner.isActive,
        description: editingBanner.description || '',
        startDate: formatDateForInput(editingBanner.startedAt),
        endDate: formatDateForInput(editingBanner.endedAt),
      });
      setPreviewUrl(editingBanner.imageUrl);
    } else {
      setFormData(createInitialFormData(defaultPositionCode));
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  }, [editingBanner, positions, defaultPositionCode]);

  const handleTitleChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  }, []);

  const handlePositionChange = useCallback((positionCode: string) => {
    setFormData(prev => ({ ...prev, positionCode }));
  }, []);

  const handleLinkTypeChange = useCallback((linkType: LinkType) => {
    setFormData(prev => ({ 
      ...prev, 
      linkType,
      linkUrl: linkType === 'none' || linkType === 'category' ? '' : prev.linkUrl 
    }));
  }, []);

  const handleLinkUrlChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, linkUrl: value }));
  }, []);

  const handleCategorySelect = useCallback((categorySlug: string) => {
    setFormData(prev => ({ ...prev, linkUrl: `${CATEGORY_LINK_PREFIX}${categorySlug}` }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  }, []);

  const handleStartDateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, startDate: value }));
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, endDate: value }));
  }, []);

  const handleFileSelect = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(createInitialFormData(defaultPositionCode));
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [defaultPositionCode]);

  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      setError('배너명을 입력해주세요');
      return false;
    }
    if (!formData.positionCode) {
      setError('배너 위치를 선택해주세요');
      return false;
    }
    if (!selectedFile && !formData.imageUrl) {
      setError('배너 이미지를 업로드해주세요');
      return false;
    }
    if (formData.linkType === 'category' && !formData.linkUrl.startsWith(CATEGORY_LINK_PREFIX)) {
      setError('연결할 카테고리를 선택해주세요');
      return false;
    }
    setError(null);
    return true;
  }, [formData, selectedFile]);

  const submitForm = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const position = positions.find(p => p.code === formData.positionCode);
      if (!position) {
        setError('배너 위치 정보를 찾을 수 없습니다');
        return false;
      }

      let imageUrl = formData.imageUrl;

      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);
        formDataUpload.append('purpose', 'banner');
        
        const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error('이미지 업로드에 실패했습니다');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.objectPath;
      }

      const isEditing = !!editingBanner;
      const url = isEditing 
        ? `${API_BASE_URL}/admin/banners/${editingBanner.id}` 
        : `${API_BASE_URL}/admin/banners`;
      const method = isEditing ? 'PUT' : 'POST';

      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: formData.title,
          bannerPositionId: position.id,
          imageUrl,
          linkUrl: formData.linkUrl || null,
          isActive: formData.isActive,
          description: formData.description || null,
          startedAt: formData.startDate || null,
          endedAt: formData.endDate || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isEditing ? '배너 수정에 실패했습니다' : '배너 등록에 실패했습니다'));
      }

      resetForm();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '배너 등록에 실패했습니다');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedFile, positions, validateForm, resetForm, editingBanner]);

  const selectedCategorySlug = formData.linkUrl.startsWith(CATEGORY_LINK_PREFIX)
    ? formData.linkUrl.slice(CATEGORY_LINK_PREFIX.length)
    : '';

  return {
    formData,
    isSubmitting,
    error,
    selectedFile,
    previewUrl,
    categoryOptions,
    selectedCategorySlug,
    handleTitleChange,
    handlePositionChange,
    handleLinkTypeChange,
    handleLinkUrlChange,
    handleCategorySelect,
    handleDescriptionChange,
    handleStartDateChange,
    handleEndDateChange,
    handleFileSelect,
    resetForm,
    submitForm,
  };
}
