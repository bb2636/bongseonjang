import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAddresses, AddressResponse } from '../api/addressApi';
import { fetchUserProfile } from '../../profile/api/profileApi';
import { useToast } from '../../../contexts/ToastContext';
import { AddressInputForm } from '@components';
import './AddressFormPage.css';

interface AddressFormData {
  recipientName: string;
  recipientPhone: string;
  addressName: string;
  postalCode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

const initialFormData: AddressFormData = {
  recipientName: '',
  recipientPhone: '',
  addressName: '',
  postalCode: '',
  address: '',
  addressDetail: '',
  isDefault: false,
};

const formatPhoneNumber = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};

export function AddressFormPage() {
  const goBack = useGoBack();
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchUserProfile,
    staleTime: 1000 * 60 * 5,
  });

  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: isEditMode,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (userProfile?.phone) {
      setFormData(prev => ({
        ...prev,
        recipientPhone: formatPhoneNumber(userProfile.phone || ''),
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (isEditMode && addresses.length > 0) {
      const existingAddress = addresses.find((addr: AddressResponse) => addr.id === id);
      if (existingAddress) {
        const phoneValue = userProfile?.phone || existingAddress.recipientPhone;
        setFormData({
          recipientName: existingAddress.recipientName,
          recipientPhone: formatPhoneNumber(phoneValue),
          addressName: existingAddress.addressName,
          postalCode: existingAddress.postalCode,
          address: existingAddress.address,
          addressDetail: existingAddress.addressDetail || '',
          isDefault: existingAddress.isDefault,
        });
      }
    }
  }, [isEditMode, addresses, id, userProfile]);

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    if (field === 'recipientPhone' && typeof value === 'string') {
      setFormData(prev => ({ ...prev, [field]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAddressSearchResult = useCallback((postalCode: string, address: string) => {
    setFormData(prev => ({
      ...prev,
      postalCode: postalCode,
      address: address,
    }));
  }, []);

  const handleAddressSearchError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const saveAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const token = localStorage.getItem('user_token');
      const url = isEditMode ? `/api/address/${id}` : '/api/address';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '배송지 저장에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      queryClient.invalidateQueries({ queryKey: ['defaultAddress'] });
      showToast(isEditMode ? '배송지가 수정되었습니다' : '배송지가 추가되었습니다', 'success');
      goBack();
    },
    onError: (error: Error) => {
      showToast(error.message, 'error');
    },
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.recipientName.trim()) {
      showToast('받으실 분을 입력해주세요', 'error');
      return;
    }
    if (!formData.recipientPhone.trim()) {
      showToast('휴대폰 번호를 입력해주세요', 'error');
      return;
    }
    if (!formData.addressName.trim()) {
      showToast('배송지명을 입력해주세요', 'error');
      return;
    }
    if (!formData.postalCode || !formData.address) {
      showToast('주소를 검색해주세요', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveAddressMutation.mutateAsync(formData);
    } catch (error) {
      if (error instanceof Error && error.message.includes('pattern')) {
        showToast('입력 형식이 올바르지 않습니다. 다시 시도해주세요.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    goBack();
  };

  const pageTitle = isEditMode ? '배송지 수정' : '배송지 추가';

  return (
    <div className="address-form-page">
      <header className="address-form-header">
        <button
          type="button"
          className="address-form-header__button"
          onClick={handleClose}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#101112"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="address-form-header__title">{pageTitle}</span>
        <button
          type="button"
          className="address-form-header__button"
          onClick={handleClose}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
              d="M6.5 6.5L19.5 19.5M19.5 6.5L6.5 19.5"
              stroke="rgba(12, 12, 12, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <form className="address-form-content" onSubmit={handleSubmit} noValidate>
        <div className="address-form-field">
          <label className="address-form-field__label">받으실 분</label>
          <div className="address-form-field__input-wrapper">
            <input
              type="text"
              className="address-form-field__input"
              placeholder="성함을 입력해주세요"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
            />
          </div>
        </div>

        <div className="address-form-field">
          <label className="address-form-field__label">휴대폰 번호</label>
          <div className="address-form-field__input-wrapper">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="address-form-field__input"
              placeholder="휴대폰 번호를 입력해주세요"
              value={formData.recipientPhone}
              onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
              maxLength={11}
            />
          </div>
        </div>

        <AddressInputForm
          addressName={formData.addressName}
          postalCode={formData.postalCode}
          address={formData.address}
          addressDetail={formData.addressDetail}
          onAddressNameChange={(value) => handleInputChange('addressName', value)}
          onAddressDetailChange={(value) => handleInputChange('addressDetail', value)}
          onAddressSearch={handleAddressSearchResult}
          onSearchError={handleAddressSearchError}
          showLabel={false}
        />

        <div className="address-form-field address-form-field--checkbox">
          <label className="address-form-checkbox">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            />
            <span className="address-form-checkbox__mark"></span>
            <span className="address-form-checkbox__label">기본 배송지로 설정</span>
          </label>
        </div>

        <button
          type="submit"
          className="address-form-submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  );
}
