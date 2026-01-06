import { useState, useRef, useEffect, useCallback } from 'react';
import './FaqList.css';

interface FaqItem {
  id: number;
  categoryId: number;
  categoryName: string;
  title: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FaqCategory {
  id: number;
  name: string;
  sortOrder: number;
}

interface FaqListProps {
  onAdd: () => void;
  onView: (id: number) => void;
  onCategoriesLoaded?: (categories: FaqCategory[]) => void;
  refreshTrigger?: number;
}

export function FaqList({ onAdd, onView, onCategoriesLoaded, refreshTrigger }: FaqListProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/admin/faqs/categories', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQ categories:', error);
    }
  }, []);

  const fetchFaqs = useCallback(async (keyword = '', categoryId: number | null = null) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) {
        params.append('keyword', keyword);
      }
      if (categoryId) {
        params.append('categoryId', categoryId.toString());
      }
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/faqs?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchFaqs();
  }, [fetchCategories, fetchFaqs]);

  useEffect(() => {
    if (categories.length > 0 && onCategoriesLoaded) {
      onCategoriesLoaded(categories);
    }
  }, [categories, onCategoriesLoaded]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchFaqs(searchKeyword, selectedCategoryId);
    }
  }, [refreshTrigger]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchFaqs(keyword, selectedCategoryId);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setIsDropdownOpen(false);
    fetchFaqs(searchKeyword, categoryId);
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return '카테고리 선택';
    const category = categories.find(c => c.id === selectedCategoryId);
    return category?.name ?? '카테고리 선택';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="faq-list">
      <div className="faq-list__header">
        <div className="faq-list__count">
          <span className="faq-list__count-label">총 FAQ 수</span>
          <span className="faq-list__count-dot" />
          <span className="faq-list__count-value">{totalCount}</span>
        </div>

        <div className="faq-list__actions">
          <div className="faq-list__search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 17.5L13.875 13.875" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="faq-list__search-input"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="faq-list__category-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="faq-list__category-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="faq-list__category-text">
                {getSelectedCategoryName()}
              </span>
              <svg 
                className={`faq-list__category-arrow ${isDropdownOpen ? 'faq-list__category-arrow--open' : ''}`}
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="rgba(12, 12, 12, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="faq-list__category-menu">
                <button
                  type="button"
                  className={`faq-list__category-option ${!selectedCategoryId ? 'faq-list__category-option--selected' : ''}`}
                  onClick={() => handleCategoryChange(null)}
                >
                  전체
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`faq-list__category-option ${selectedCategoryId === cat.id ? 'faq-list__category-option--selected' : ''}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button type="button" className="faq-list__add-button" onClick={onAdd}>
            FAQ 등록
          </button>
        </div>
      </div>

      <div className="faq-list__table">
        <div className="faq-list__table-header">
          <div className="faq-list__table-cell">카테고리</div>
          <div className="faq-list__table-cell">질문</div>
          <div className="faq-list__table-cell">최근 수정일</div>
          <div className="faq-list__table-cell">노출</div>
          <div className="faq-list__table-cell">관리</div>
        </div>

        <div className="faq-list__table-body">
          {isLoading ? (
            <div className="faq-list__loading">로딩 중...</div>
          ) : faqs.length === 0 ? (
            <div className="faq-list__empty">등록된 FAQ가 없습니다.</div>
          ) : (
            faqs.map(faq => (
              <div 
                key={faq.id} 
                className="faq-list__table-row"
              >
                <div className="faq-list__table-cell">
                  <span className="faq-list__category-badge">{faq.categoryName}</span>
                </div>
                <div className="faq-list__table-cell faq-list__table-cell--question">
                  {faq.title}
                </div>
                <div className="faq-list__table-cell">
                  {formatDate(faq.updatedAt)}
                </div>
                <div className="faq-list__table-cell">
                  <span className={`faq-list__status-badge ${faq.isVisible ? 'faq-list__status-badge--visible' : 'faq-list__status-badge--hidden'}`}>
                    {faq.isVisible ? '노출' : '숨김'}
                  </span>
                </div>
                <div className="faq-list__table-cell">
                  <button
                    type="button"
                    className="faq-list__view-button"
                    onClick={() => onView(faq.id)}
                  >
                    보기
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
