import { useState, useCallback, useEffect } from 'react';
import { BannerPosition } from './useBannerManagement';

export interface BannerFormData {
  title: string;
  positionCode: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

function createInitialFormData(defaultPositionCode: string): BannerFormData {
  return {
    title: '',
    positionCode: defaultPositionCode,
    imageUrl: '',
    linkUrl: '',
    isActive: true,
  };
}

export function useBannerForm(positions: BannerPosition[], defaultPositionCode: string = 'HOME_HERO') {
  const [formData, setFormData] = useState<BannerFormData>(() => createInitialFormData(defaultPositionCode));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setFormData(prev => ({ ...prev, positionCode: defaultPositionCode }));
  }, [defaultPositionCode]);

  const handleTitleChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
  }, []);

  const handlePositionChange = useCallback((positionCode: string) => {
    setFormData(prev => ({ ...prev, positionCode }));
  }, []);

  const handleLinkUrlChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, linkUrl: value }));
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
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          throw new Error('이미지 업로드에 실패했습니다');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = `/api/upload${uploadResult.objectPath}`;
      }

      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          bannerPositionId: position.id,
          imageUrl,
          linkUrl: formData.linkUrl || null,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '배너 등록에 실패했습니다');
      }

      resetForm();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '배너 등록에 실패했습니다');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedFile, positions, validateForm, resetForm]);

  return {
    formData,
    isSubmitting,
    error,
    selectedFile,
    previewUrl,
    handleTitleChange,
    handlePositionChange,
    handleLinkUrlChange,
    handleFileSelect,
    resetForm,
    submitForm,
  };
}
