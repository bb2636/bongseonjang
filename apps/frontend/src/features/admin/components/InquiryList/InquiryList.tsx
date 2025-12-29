import { useState, useRef, useEffect, useCallback } from 'react';
import './InquiryList.css';

type InquiryType = 'product' | 'shipping' | 'exchange_return' | 'refund' | 'other';

interface InquiryItem {
  id: number;
  inquiryType: InquiryType;
  productId: string | null;
  productName: string | null;
  authorId: string;
  authorName: string;
  authorPhone: string | null;
  question: string;
  isAnswered: boolean;
  createdAt: string;
}

interface InquiryListProps {
  onView: (id: number) => void;
  refreshTrigger?: number;
}

const INQUIRY_TYPE_LABELS: Record<InquiryType, string> = {
  product: '상품문의',
  shipping: '배송문의',
  exchange_return: '교환반품문의',
  refund: '환불문의',
  other: '기타',
};

const INQUIRY_TYPE_OPTIONS: { value: InquiryType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'product', label: '상품문의' },
  { value: 'shipping', label: '배송문의' },
  { value: 'exchange_return', label: '교환반품문의' },
  { value: 'refund', label: '환불문의' },
  { value: 'other', label: '기타' },
];

const STATUS_OPTIONS: { value: 'all' | 'answered' | 'unanswered'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'unanswered', label: '답변 전' },
  { value: 'answered', label: '답변 완료' },
];

export function InquiryList({ onView, refreshTrigger }: InquiryListProps) {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<InquiryType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchKeyword) {
        params.append('keyword', searchKeyword);
      }
      if (selectedType !== 'all') {
        params.append('inquiryType', selectedType);
      }
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }
      const response = await fetch(`/api/admin/inquiries?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setInquiries(data.inquiries);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchKeyword, selectedType, selectedStatus]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchInquiries();
    }
  }, [refreshTrigger, fetchInquiries]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleTypeChange = (type: InquiryType | 'all') => {
    setSelectedType(type);
    setIsTypeDropdownOpen(false);
  };

  const handleStatusChange = (status: 'all' | 'answered' | 'unanswered') => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
  };

  const getSelectedTypeLabel = () => {
    const option = INQUIRY_TYPE_OPTIONS.find(opt => opt.value === selectedType);
    return option?.label ?? '유형 선택';
  };

  const getSelectedStatusLabel = () => {
    const option = STATUS_OPTIONS.find(opt => opt.value === selectedStatus);
    return option?.label ?? '상태 선택';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    return phone;
  };

  return (
    <div className="inquiry-list">
      <div className="inquiry-list__header">
        <div className="inquiry-list__count">
          <span className="inquiry-list__count-label">총 문의 수</span>
          <span className="inquiry-list__count-dot" />
          <span className="inquiry-list__count-value">{totalCount}</span>
        </div>

        <div className="inquiry-list__actions">
          <div className="inquiry-list__search">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17.5 17.5L13.875 13.875" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              className="inquiry-list__search-input"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <div className="inquiry-list__dropdown" ref={statusDropdownRef}>
            <button
              type="button"
              className="inquiry-list__dropdown-trigger"
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            >
              <span className="inquiry-list__dropdown-text">
                {getSelectedStatusLabel()}
              </span>
              <svg 
                className={`inquiry-list__dropdown-arrow ${isStatusDropdownOpen ? 'inquiry-list__dropdown-arrow--open' : ''}`}
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="rgba(12, 12, 12, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isStatusDropdownOpen && (
              <div className="inquiry-list__dropdown-menu">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`inquiry-list__dropdown-option ${selectedStatus === opt.value ? 'inquiry-list__dropdown-option--selected' : ''}`}
                    onClick={() => handleStatusChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="inquiry-list__dropdown" ref={typeDropdownRef}>
            <button
              type="button"
              className="inquiry-list__dropdown-trigger"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            >
              <span className="inquiry-list__dropdown-text">
                {getSelectedTypeLabel()}
              </span>
              <svg 
                className={`inquiry-list__dropdown-arrow ${isTypeDropdownOpen ? 'inquiry-list__dropdown-arrow--open' : ''}`}
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path d="M6 9L12 15L18 9" stroke="rgba(12, 12, 12, 0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isTypeDropdownOpen && (
              <div className="inquiry-list__dropdown-menu">
                {INQUIRY_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`inquiry-list__dropdown-option ${selectedType === opt.value ? 'inquiry-list__dropdown-option--selected' : ''}`}
                    onClick={() => handleTypeChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="inquiry-list__table">
        <div className="inquiry-list__table-header">
          <div className="inquiry-list__table-cell inquiry-list__table-cell--user">사용자</div>
          <div className="inquiry-list__table-cell inquiry-list__table-cell--type">문의 유형</div>
          <div className="inquiry-list__table-cell inquiry-list__table-cell--product">문의 상품</div>
          <div className="inquiry-list__table-cell inquiry-list__table-cell--question">문의 제목</div>
          <div className="inquiry-list__table-cell inquiry-list__table-cell--date">문의 등록일</div>
          <div className="inquiry-list__table-cell inquiry-list__table-cell--status">상태</div>
          <div className="inquiry-list__table-cell inquiry-list__table-cell--action">관리</div>
        </div>

        <div className="inquiry-list__table-body">
          {isLoading ? (
            <div className="inquiry-list__loading">로딩 중...</div>
          ) : inquiries.length === 0 ? (
            <div className="inquiry-list__empty">등록된 문의가 없습니다.</div>
          ) : (
            inquiries.map(inquiry => (
              <div 
                key={inquiry.id} 
                className="inquiry-list__table-row"
              >
                <div className="inquiry-list__table-cell inquiry-list__table-cell--user">
                  <div className="inquiry-list__user-info">
                    <span className="inquiry-list__user-name">{inquiry.authorName}</span>
                    <span className="inquiry-list__user-phone">{formatPhone(inquiry.authorPhone)}</span>
                  </div>
                </div>
                <div className="inquiry-list__table-cell inquiry-list__table-cell--type">
                  {INQUIRY_TYPE_LABELS[inquiry.inquiryType]}
                </div>
                <div className="inquiry-list__table-cell inquiry-list__table-cell--product">
                  {inquiry.productName || '-'}
                </div>
                <div className="inquiry-list__table-cell inquiry-list__table-cell--question">
                  {inquiry.question.length > 30 ? `${inquiry.question.substring(0, 30)}...` : inquiry.question}
                </div>
                <div className="inquiry-list__table-cell inquiry-list__table-cell--date">
                  {formatDate(inquiry.createdAt)}
                </div>
                <div className="inquiry-list__table-cell inquiry-list__table-cell--status">
                  <span className={`inquiry-list__status-badge ${inquiry.isAnswered ? 'inquiry-list__status-badge--answered' : 'inquiry-list__status-badge--unanswered'}`}>
                    {inquiry.isAnswered ? '답변 완료' : '답변 전'}
                  </span>
                </div>
                <div className="inquiry-list__table-cell inquiry-list__table-cell--action">
                  <button
                    type="button"
                    className="inquiry-list__view-button"
                    onClick={() => {
                      console.log('View button clicked for inquiry:', inquiry.id);
                      onView(inquiry.id);
                    }}
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
