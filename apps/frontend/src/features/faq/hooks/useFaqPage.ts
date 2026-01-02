import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaqCategory, FaqItem } from '../types/faq';
import { useGoBack } from '../../../hooks/useGoBack';

export function useFaqPage() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/faqs/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
        if (data.length > 0 && selectedCategoryId === null) {
          setSelectedCategoryId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch FAQ categories:', error);
    }
  }, [selectedCategoryId]);

  const fetchFaqs = useCallback(async (categoryId: number | null) => {
    if (categoryId === null) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('categoryId', categoryId.toString());
      
      const response = await fetch(`/api/faqs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs);
        if (data.faqs.length > 0) {
          setExpandedFaqId(data.faqs[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (selectedCategoryId !== null) {
      fetchFaqs(selectedCategoryId);
    }
  }, [selectedCategoryId, fetchFaqs]);

  const filteredFaqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return faqs;
    }
    return faqs.filter((faq) => 
      faq.title.toLowerCase().includes(normalizedQuery)
    );
  }, [searchQuery, faqs]);

  const handleBack = () => {
    goBack();
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setExpandedFaqId(null);
    setSearchQuery('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleToggle = (faqId: number) => {
    setExpandedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  return {
    state: {
      categories,
      selectedCategoryId,
      searchQuery,
      filteredFaqs,
      expandedFaqId,
      isLoading,
    },
    actions: {
      handleBack,
      handleCartClick,
      handleCategorySelect,
      handleSearchChange,
      handleToggle,
    },
  };
}
