import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { InquiryItem, InquiryType, SortOrder } from '../types/inquiry';
import { INQUIRY_TYPE_FILTER_OPTIONS } from '../types/inquiry';
import { fetchMyInquiries } from '../api/inquiryApi';

export interface InquiryListPageState {
  inquiries: InquiryItem[];
  filteredInquiries: InquiryItem[];
  isLoading: boolean;
  error: string | null;
  selectedType: InquiryType | 'all';
  sortOrder: SortOrder;
  isTypeDropdownOpen: boolean;
  typeOptions: typeof INQUIRY_TYPE_FILTER_OPTIONS;
  handleBack: () => void;
  handleCartClick: () => void;
  handleInquiryClick: (id: number) => void;
  handleTypeChange: (type: InquiryType | 'all') => void;
  handleSortChange: (order: SortOrder) => void;
  handleToggleTypeDropdown: () => void;
  handleCloseTypeDropdown: () => void;
}

export function useInquiryListPage(): InquiryListPageState {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<InquiryType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadInquiries() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchMyInquiries();
        setInquiries(data);
      } catch (err) {
        console.error('Failed to load inquiries:', err);
        setError('문의 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    loadInquiries();
  }, []);

  const filteredInquiries = useMemo(() => {
    let result = [...inquiries];

    if (selectedType !== 'all') {
      result = result.filter((inquiry) => inquiry.inquiryType === selectedType);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [inquiries, selectedType, sortOrder]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleCartClick = useCallback(() => {
    navigate('/cart');
  }, [navigate]);

  const handleInquiryClick = useCallback((id: number) => {
    navigate(`/inquiry/${id}`);
  }, [navigate]);

  const handleTypeChange = useCallback((type: InquiryType | 'all') => {
    setSelectedType(type);
    setIsTypeDropdownOpen(false);
  }, []);

  const handleSortChange = useCallback((order: SortOrder) => {
    setSortOrder(order);
  }, []);

  const handleToggleTypeDropdown = useCallback(() => {
    setIsTypeDropdownOpen((prev) => !prev);
  }, []);

  const handleCloseTypeDropdown = useCallback(() => {
    setIsTypeDropdownOpen(false);
  }, []);

  return {
    inquiries,
    filteredInquiries,
    isLoading,
    error,
    selectedType,
    sortOrder,
    isTypeDropdownOpen,
    typeOptions: INQUIRY_TYPE_FILTER_OPTIONS,
    handleBack,
    handleCartClick,
    handleInquiryClick,
    handleTypeChange,
    handleSortChange,
    handleToggleTypeDropdown,
    handleCloseTypeDropdown,
  };
}
