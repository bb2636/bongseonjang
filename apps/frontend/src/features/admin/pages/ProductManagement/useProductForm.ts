import { useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '@/shared/config/apiConfig';

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

export type ShippingRegion = 'JEJU' | 'ISLAND' | 'JEJU_ISLAND';

export interface ShippingSurcharge {
  id: string;
  region: ShippingRegion;
  amount: number | null;
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
  exposureCategoryIds: string[];
  basePrice: number;
  discountEnabled: boolean;
  discountRate: number;
  discountedPrice: number;
  storageMethod: string;
  expirationInfo: string;
  description: string;
  caution: string;
  useOptions: boolean;
  optionGroupName: string;
  options: ProductOption[];
  productInfos: ProductInfo[];
  shippingInfo: ShippingInfo;
  shippingSurcharges: ShippingSurcharge[];
  thumbnailImages: ImageFile[];
  detailImages: ImageFile[];
  weight: string;
  origin: string;
  shippingMethod: string;
  stockQuantity: number;
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

function createEmptyShippingSurcharge(): ShippingSurcharge {
  return {
    id: generateId(),
    region: 'JEJU_ISLAND',
    amount: null,
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
    exposureCategoryIds: [],
    basePrice: 0,
    discountEnabled: false,
    discountRate: 0,
    discountedPrice: 0,
    storageMethod: '',
    expirationInfo: '',
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
    shippingSurcharges: [createEmptyShippingSurcharge()],
    thumbnailImages: [],
    detailImages: [],
    weight: '',
    origin: '',
    shippingMethod: '',
    stockQuantity: 0,
  };
}

export interface Category {
  id: string;
  name: string;
}

export interface ExposureCategory {
  id: string;
  name: string;
}

export interface FieldErrors {
  name?: string;
  categoryId?: string;
  exposureCategoryIds?: string;
  basePrice?: string;
  description?: string;
  thumbnailImages?: string;
  detailImages?: string;
}

export function useProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(createInitialFormData);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exposureCategories, setExposureCategories] = useState<ExposureCategory[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const editingProductIdRef = useRef<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
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

  const handleExposureCategoryChange = useCallback((exposureCategoryIds: string[]) => {
    setFormData(prev => ({ ...prev, exposureCategoryIds }));
  }, []);

  const fetchExposureCategories = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/products/exposure-categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExposureCategories((data.categories || []).map((cat: { id: number; name: string }) => ({
          id: String(cat.id),
          name: cat.name,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch exposure categories:', err);
    }
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
      const validRate = (rate < 0 || rate > 100) ? 0 : rate;
      const newDiscountedPrice = Math.round(prev.basePrice * (1 - validRate / 100));
      return { ...prev, discountRate: validRate, discountedPrice: newDiscountedPrice };
    });
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, description: value }));
  }, []);

  const handleCautionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, caution: value }));
  }, []);

  const handleStorageMethodChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, storageMethod: value }));
  }, []);

  const handleExpirationInfoChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, expirationInfo: value }));
  }, []);

  const handleWeightChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, weight: value }));
  }, []);

  const handleOriginChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, origin: value }));
  }, []);

  const handleShippingMethodChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, shippingMethod: value }));
  }, []);

  const handleStockQuantityChange = useCallback((value: number) => {
    const validValue = Math.max(0, Math.floor(value));
    setFormData(prev => ({ ...prev, stockQuantity: validValue }));
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

  const handleShippingSurchargeChange = useCallback((id: string, field: 'region' | 'amount', value: ShippingRegion | number | null) => {
    setFormData(prev => ({
      ...prev,
      shippingSurcharges: prev.shippingSurcharges.map(surcharge =>
        surcharge.id === id ? { ...surcharge, [field]: value } : surcharge
      ),
    }));
  }, []);

  const handleAddShippingSurcharge = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      shippingSurcharges: [...prev.shippingSurcharges, createEmptyShippingSurcharge()],
    }));
  }, []);

  const handleRemoveShippingSurcharge = useCallback((id: string) => {
    setFormData(prev => ({
      ...prev,
      shippingSurcharges: prev.shippingSurcharges.filter(surcharge => surcharge.id !== id),
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
    const currentFormData = formDataRef.current;
    currentFormData.thumbnailImages.forEach(img => {
      if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    currentFormData.detailImages.forEach(img => {
      if (img.previewUrl && img.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setFormData(createInitialFormData());
    setError(null);
    setEditingProductId(null);
    editingProductIdRef.current = null;
    setFieldErrors({});
    setTouched({});
  }, []);

  const loadProduct = useCallback(async (productId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setEditingProductId(productId);
    editingProductIdRef.current = productId;
    setFieldErrors({});
    setTouched({});

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('상품 정보를 불러오는데 실패했습니다');
      }

      const data = await response.json();

      const thumbnailImages: ImageFile[] = (data.thumbnailImages || []).map((img: { id: string; imageUrl: string }) => ({
        id: img.id || generateId(),
        file: null,
        previewUrl: img.imageUrl,
        uploadedUrl: img.imageUrl,
      }));

      const detailImages: ImageFile[] = (data.detailImages || []).map((img: { id: string; imageUrl: string }) => ({
        id: img.id || generateId(),
        file: null,
        previewUrl: img.imageUrl,
        uploadedUrl: img.imageUrl,
      }));

      const options: ProductOption[] = (data.options || []).length > 0
        ? data.options.map((opt: { id?: string; optionName: string; optionValue: string; price: number | null; stock: number }) => ({
            id: opt.id || generateId(),
            optionName: opt.optionName || '',
            optionValue: opt.optionValue || '',
            price: opt.price,
            stock: opt.stock || 0,
          }))
        : [createEmptyOption()];

      const productInfos: ProductInfo[] = (data.productInfos || []).length > 0
        ? data.productInfos.map((info: { label: string; value: string }) => ({
            id: generateId(),
            label: info.label || '',
            value: info.value || '',
          }))
        : [createEmptyProductInfo()];

      const shippingSurcharges: ShippingSurcharge[] = (data.shippingSurcharges || []).length > 0
        ? data.shippingSurcharges.map((surcharge: { region: ShippingRegion; amount: number }) => ({
            id: generateId(),
            region: surcharge.region,
            amount: surcharge.amount ?? null,
          }))
        : [createEmptyShippingSurcharge()];

      const hasOptions = data.options && data.options.length > 0;
      const optionGroupName = hasOptions && data.options[0]?.optionName ? data.options[0].optionName : '';

      const exposureCategoryIds = Array.isArray(data.exposureCategoryIds)
        ? data.exposureCategoryIds.map((id: number) => String(id))
        : [];

      const loadedDiscountRate = data.discountRate || 0;
      const loadedDiscountEnabled = loadedDiscountRate > 0;
      const loadedDiscountedPrice = loadedDiscountEnabled
        ? (data.discountedPrice ?? Math.round((data.basePrice || 0) * (1 - loadedDiscountRate / 100)))
        : (data.basePrice || 0);

      setFormData({
        name: data.name || '',
        categoryId: data.categoryId || '',
        exposureCategoryIds,
        basePrice: data.basePrice || 0,
        discountEnabled: loadedDiscountEnabled,
        discountRate: loadedDiscountRate,
        discountedPrice: loadedDiscountedPrice,
        storageMethod: data.storageMethod || '',
        expirationInfo: data.expirationInfo || '',
        description: data.description || '',
        caution: data.caution || '',
        useOptions: hasOptions,
        optionGroupName,
        options,
        productInfos,
        shippingInfo: data.shippingInfo || {
          shippingFee: null,
          freeShippingThreshold: null,
          shippingDescription: '전국',
        },
        shippingSurcharges,
        thumbnailImages,
        detailImages,
        weight: data.weight || '',
        origin: data.origin || '',
        shippingMethod: data.shippingMethod || '',
        stockQuantity: data.stockQuantity || 0,
      });

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '상품 정보를 불러오는데 실패했습니다');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: FieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = '상품명을 입력해주세요';
    }
    if (!formData.categoryId) {
      errors.categoryId = '카테고리를 선택해주세요';
    }
    if (formData.exposureCategoryIds.length === 0) {
      errors.exposureCategoryIds = '노출 카테고리를 최소 1개 선택해주세요';
    }
    if (formData.basePrice <= 0) {
      errors.basePrice = '기본 판매가를 입력해주세요';
    }
    if (!formData.description.trim()) {
      errors.description = '상품설명을 입력해주세요';
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
      exposureCategoryIds: true,
      basePrice: true,
      description: true,
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

    const token = sessionStorage.getItem('admin_token');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formDataUpload,
    });

    if (!response.ok) {
      throw new Error('이미지 업로드에 실패했습니다');
    }

    const result = await response.json();
    return result.objectPath;
  };

  const submitForm = useCallback(async (): Promise<boolean> => {
    console.log('[DEBUG submitForm] Called');
    console.log('[DEBUG submitForm] editingProductIdRef.current:', editingProductIdRef.current);
    
    if (!validateForm()) {
      console.log('[DEBUG submitForm] Validation failed');
      return false;
    }

    console.log('[DEBUG submitForm] Validation passed');
    setIsSubmitting(true);
    setError(null);

    const currentEditingProductId = editingProductIdRef.current;
    const isUpdate = !!currentEditingProductId;
    console.log('[DEBUG submitForm] isUpdate:', isUpdate, 'currentEditingProductId:', currentEditingProductId);

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
        exposureCategoryIds: formData.exposureCategoryIds,
        basePrice: formData.basePrice,
        discountRate: formData.discountEnabled ? formData.discountRate : 0,
        storageMethod: formData.storageMethod,
        expirationInfo: formData.expirationInfo,
        description: formData.description,
        caution: formData.caution,
        optionGroupName: formData.useOptions ? formData.optionGroupName : null,
        options: formData.useOptions
          ? formData.options.filter(opt => opt.optionValue.trim()).map(opt => ({
              id: isUpdate ? opt.id : undefined,
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
        shippingSurcharges: formData.shippingSurcharges
          .filter(surcharge => surcharge.amount != null && surcharge.amount > 0)
          .map(surcharge => ({
            region: surcharge.region,
            amount: surcharge.amount as number,
          })),
        shippingInfo: formData.shippingInfo,
        thumbnailUrls,
        detailUrls,
        weight: formData.weight,
        origin: formData.origin,
        shippingMethod: formData.shippingMethod,
        stockQuantity: formData.useOptions ? 0 : formData.stockQuantity,
      };

      const url = isUpdate
        ? `/api/admin/products/${currentEditingProductId}`
        : '/api/admin/products';
      
      console.log('[DEBUG submitForm] Sending request to:', url, 'method:', isUpdate ? 'PUT' : 'POST');
      
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      console.log('[DEBUG submitForm] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (isUpdate ? '상품 수정에 실패했습니다' : '상품 등록에 실패했습니다'));
      }

      resetForm();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : (isUpdate ? '상품 수정에 실패했습니다' : '상품 등록에 실패했습니다'));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, resetForm]);

  return {
    formData,
    categories,
    exposureCategories,
    isSubmitting,
    isLoading,
    error,
    fieldErrors,
    touched,
    editingProductId,
    shippingLabels: SHIPPING_LABELS,
    fetchCategories,
    fetchExposureCategories,
    loadProduct,
    handleNameChange,
    handleCategoryChange,
    handleExposureCategoryChange,
    handleBasePriceChange,
    handleDiscountEnabledChange,
    handleDiscountRateChange,
    handleDescriptionChange,
    handleCautionChange,
    handleStorageMethodChange,
    handleExpirationInfoChange,
    handleWeightChange,
    handleOriginChange,
    handleShippingMethodChange,
    handleStockQuantityChange,
    handleUseOptionsChange,
    handleOptionGroupNameChange,
    handleOptionChange,
    handleAddOption,
    handleRemoveOption,
    handleProductInfoChange,
    handleAddProductInfo,
    handleRemoveProductInfo,
    handleShippingSurchargeChange,
    handleAddShippingSurcharge,
    handleRemoveShippingSurcharge,
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
