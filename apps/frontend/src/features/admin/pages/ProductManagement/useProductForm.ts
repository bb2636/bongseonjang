import { useState, useCallback } from 'react';

export interface ProductOption {
  id: string;
  optionName: string;
  optionValue: string;
  price: number | null;
  stock: number;
}

export interface ProductInfo {
  id: string;
  label: string;
  value: string;
}

export interface ShippingInfo {
  shippingFee: number | null;
  freeShippingThreshold: number | null;
  shippingDescription: string;
}

export interface ImageFile {
  id: string;
  file: File | null;
  previewUrl: string;
  uploadedUrl?: string;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  basePrice: number;
  discountEnabled: boolean;
  discountRate: number;
  discountedPrice: number;
  startDate: string;
  endDate: string;
  countdownDays: number | null;
  description: string;
  caution: string;
  useOptions: boolean;
  optionGroupName: string;
  options: ProductOption[];
  productInfos: ProductInfo[];
  shippingInfo: ShippingInfo;
  thumbnailImages: ImageFile[];
  detailImages: ImageFile[];
}

const SHIPPING_LABELS = {
  shippingFee: '택배비',
  freeShippingThreshold: '무료배송 기준',
  shippingDescription: '배송가능지역',
};

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function createEmptyOption(): ProductOption {
  return {
    id: generateId(),
    optionName: '',
    optionValue: '',
    price: null,
    stock: 0,
  };
}

function createEmptyProductInfo(): ProductInfo {
  return {
    id: generateId(),
    label: '',
    value: '',
  };
}

function createEmptyImageFile(): ImageFile {
  return {
    id: generateId(),
    file: null,
    previewUrl: '',
  };
}

function createInitialFormData(): ProductFormData {
  return {
    name: '',
    categoryId: '',
    basePrice: 0,
    discountEnabled: false,
    discountRate: 0,
    discountedPrice: 0,
    startDate: '',
    endDate: '',
    countdownDays: null,
    description: '',
    caution: '',
    useOptions: false,
    optionGroupName: '',
    options: [createEmptyOption()],
    productInfos: [createEmptyProductInfo()],
    shippingInfo: {
      shippingFee: null,
      freeShippingThreshold: null,
      shippingDescription: '전국',
    },
    thumbnailImages: [],
    detailImages: [],
  };
}

export interface Category {
  id: string;
  name: string;
}

export interface FieldErrors {
  name?: string;
  categoryId?: string;
  basePrice?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  thumbnailImages?: string;
  detailImages?: string;
}

export function useProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(createInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/products/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, name: value }));
  }, []);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setFormData(prev => ({ ...prev, categoryId }));
  }, []);

  const handleBasePriceChange = useCallback((value: number) => {
    setFormData(prev => {
      const newDiscountedPrice = prev.discountEnabled
        ? Math.round(value * (1 - prev.discountRate / 100))
        : value;
      return { ...prev, basePrice: value, discountedPrice: newDiscountedPrice };
    });
  }, []);

  const handleDiscountEnabledChange = useCallback((enabled: boolean) => {
    setFormData(prev => {
      const newDiscountedPrice = enabled
        ? Math.round(prev.basePrice * (1 - prev.discountRate / 100))
        : prev.basePrice;
      return { ...prev, discountEnabled: enabled, discountedPrice: newDiscountedPrice };
    });
  }, []);

  const handleDiscountRateChange = useCallback((rate: number) => {
    setFormData(prev => {
      const newDiscountedPrice = Math.round(prev.basePrice * (1 - rate / 100));
      return { ...prev, discountRate: rate, discountedPrice: newDiscountedPrice };
    });
  }, []);

  const handleStartDateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, startDate: value }));
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, endDate: value }));
  }, []);

  const handleCountdownDaysChange = useCallback((value: number | null) => {
    setFormData(prev => ({ ...prev, countdownDays: value }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  }, []);

  const handleCautionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, caution: value }));
  }, []);

  const handleUseOptionsChange = useCallback((useOptions: boolean) => {
    setFormData(prev => ({ ...prev, useOptions }));
  }, []);

  const handleOptionGroupNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, optionGroupName: value }));
  }, []);

  const handleOptionChange = useCallback((id: string, field: keyof ProductOption, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(opt =>
        opt.id === id ? { ...opt, [field]: value } : opt
      ),
    }));
  }, []);

  const handleAddOption = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, createEmptyOption()],
    }));
  }, []);

  const handleRemoveOption = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== id),
    }));
  }, []);

  const handleProductInfoChange = useCallback((id: string, field: 'label' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      productInfos: prev.productInfos.map(info =>
        info.id === id ? { ...info, [field]: value } : info
      ),
    }));
  }, []);

  const handleAddProductInfo = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      productInfos: [...prev.productInfos, createEmptyProductInfo()],
    }));
  }, []);

  const handleRemoveProductInfo = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      productInfos: prev.productInfos.filter(info => info.id !== id),
    }));
  }, []);

  const handleShippingInfoChange = useCallback((field: keyof ShippingInfo, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      shippingInfo: { ...prev.shippingInfo, [field]: value },
    }));
  }, []);

  const handleThumbnailImageAdd = useCallback((file: File) => {
    if (formData.thumbnailImages.length >= 5) return;
    
    const previewUrl = URL.createObjectURL(file);
    const newImage: ImageFile = {
      id: generateId(),
      file,
      previewUrl,
    };
    setFormData(prev => ({
      ...prev,
      thumbnailImages: [...prev.thumbnailImages, newImage],
    }));
  }, [formData.thumbnailImages.length]);

  const handleThumbnailImageRemove = useCallback((id: string) => {
    setFormData(prev => {
      const image = prev.thumbnailImages.find(img => img.id === id);
      if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return {
        ...prev,
        thumbnailImages: prev.thumbnailImages.filter(img => img.id !== id),
      };
    });
  }, []);

  const handleDetailImageAdd = useCallback((file: File) => {
    if (formData.detailImages.length >= 5) return;
    
    const previewUrl = URL.createObjectURL(file);
    const newImage: ImageFile = {
      id: generateId(),
      file,
      previewUrl,
    };
    setFormData(prev => ({
      ...prev,
      detailImages: [...prev.detailImages, newImage],
    }));
  }, [formData.detailImages.length]);

  const handleDetailImageRemove = useCallback((id: string) => {
    setFormData(prev => {
      const image = prev.detailImages.find(img => img.id === id);
      if (image?.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
      return {
        ...prev,
        detailImages: prev.detailImages.filter(img => img.id !== id),
      };
    });
  }, []);

  const resetForm = useCallback(() => {
    formData.thumbnailImages.forEach(img => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    formData.detailImages.forEach(img => {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    });
    setFormData(createInitialFormData());
    setError(null);
  }, [formData.thumbnailImages, formData.detailImages]);

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = '상품명을 입력해주세요';
    }
    if (!formData.categoryId) {
      errors.categoryId = '카테고리를 선택해주세요';
    }
    if (formData.basePrice <= 0) {
      errors.basePrice = '기본 판매가를 입력해주세요';
    }
    if (!formData.description.trim()) {
      errors.description = '상품설명을 입력해주세요';
    }
    if (!formData.startDate) {
      errors.startDate = '판매 시작일을 선택해주세요';
    }
    if (!formData.endDate) {
      errors.endDate = '판매 종료일을 선택해주세요';
    }
    if (formData.thumbnailImages.length === 0) {
      errors.thumbnailImages = '썸네일 이미지를 최소 1장 업로드해주세요';
    }
    if (formData.detailImages.length === 0) {
      errors.detailImages = '상세페이지 이미지를 최소 1장 업로드해주세요';
    }

    setFieldErrors(errors);
    setTouched({
      name: true,
      categoryId: true,
      basePrice: true,
      description: true,
      startDate: true,
      endDate: true,
      thumbnailImages: true,
      detailImages: true,
    });

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      const firstError = Object.values(errors)[0];
      setError(firstError || '필수 항목을 모두 입력해주세요');
    } else {
      setError(null);
    }
    
    return !hasErrors;
  }, [formData]);

  const clearFieldError = useCallback((field: keyof FieldErrors) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const markFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const uploadImage = async (file: File, purpose: string): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    formDataUpload.append('purpose', purpose);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다');
    }

    const result = await response.json();
    return result.objectPath;
  };

  const submitForm = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const thumbnailUrls: string[] = [];
      for (const img of formData.thumbnailImages) {
        if (img.file) {
          const url = await uploadImage(img.file, 'product-thumbnail');
          thumbnailUrls.push(url);
        } else if (img.uploadedUrl) {
          thumbnailUrls.push(img.uploadedUrl);
        }
      }

      const detailUrls: string[] = [];
      for (const img of formData.detailImages) {
        if (img.file) {
          const url = await uploadImage(img.file, 'product-detail');
          detailUrls.push(url);
        } else if (img.uploadedUrl) {
          detailUrls.push(img.uploadedUrl);
        }
      }

      const productData = {
        name: formData.name,
        categoryId: formData.categoryId,
        basePrice: formData.discountEnabled ? formData.discountedPrice : formData.basePrice,
        originalPrice: formData.basePrice,
        discountRate: formData.discountEnabled ? formData.discountRate : 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        countdownDays: formData.countdownDays,
        description: formData.description,
        caution: formData.caution,
        optionGroupName: formData.useOptions ? formData.optionGroupName : null,
        options: formData.useOptions
          ? formData.options.filter(opt => opt.optionValue.trim()).map(opt => ({
              optionName: formData.optionGroupName || '옵션',
              optionValue: opt.optionValue,
              price: opt.price,
              stock: opt.stock,
            }))
          : [],
        productInfos: formData.productInfos
          .filter(info => info.label.trim() && info.value.trim())
          .map(info => ({
            label: info.label,
            value: info.value,
          })),
        shippingInfo: formData.shippingInfo,
        thumbnailUrls,
        detailUrls,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '상품 등록에 실패했습니다');
      }

      resetForm();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 등록에 실패했습니다');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, resetForm]);

  return {
    formData,
    categories,
    isSubmitting,
    error,
    fieldErrors,
    touched,
    shippingLabels: SHIPPING_LABELS,
    fetchCategories,
    handleNameChange,
    handleCategoryChange,
    handleBasePriceChange,
    handleDiscountEnabledChange,
    handleDiscountRateChange,
    handleStartDateChange,
    handleEndDateChange,
    handleCountdownDaysChange,
    handleDescriptionChange,
    handleCautionChange,
    handleUseOptionsChange,
    handleOptionGroupNameChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleProductInfoChange,
    handleAddProductInfo,
    handleRemoveProductInfo,
    handleShippingInfoChange,
    handleThumbnailImageAdd,
    handleThumbnailImageRemove,
    handleDetailImageAdd,
    handleDetailImageRemove,
    clearFieldError,
    markFieldTouched,
    resetForm,
    submitForm,
  };
}
