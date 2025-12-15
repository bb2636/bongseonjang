import { useState, useRef, useEffect } from 'react';
import './FaqList.css';

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  isVisible: boolean;
  createdAt: string;
}

interface FaqCategory {
  id: number;
  code: string;
  name: string;
}

const MOCK_CATEGORIES: FaqCategory[] = [
  { id: 1, code: 'DELIVERY', name: '배송' },
  { id: 2, code: 'PAYMENT', name: '결제' },
  { id: 3, code: 'PRODUCT', name: '상품' },
  { id: 4, code: 'ORDER', name: '주문' },
  { id: 5, code: 'RETURN', name: '교환/반품' },
];

const MOCK_FAQS: FaqItem[] = [
  { id: 1, category: '배송', question: '배송은 얼마나 걸리나요?', answer: '일반적으로 2-3일 소요됩니다.', isVisible: true, createdAt: '2025-01-15' },
  { id: 2, category: '결제', question: '어떤 결제 수단을 사용할 수 있나요?', answer: '신용카드, 계좌이체, 간편결제를 지원합니다.', isVisible: true, createdAt: '2025-01-14' },
  { id: 3, category: '상품', question: '상품 교환은 어떻게 하나요?', answer: '고객센터로 연락 주시면 안내드립니다.', isVisible: true, createdAt: '2025-01-13' },
  { id: 4, category: '주문', question: '주문 취소는 언제까지 가능한가요?', answer: '배송 시작 전까지 가능합니다.', isVisible: false, createdAt: '2025-01-12' },
  { id: 5, category: '교환/반품', question: '반품 배송비는 누가 부담하나요?', answer: '단순 변심의 경우 고객 부담입니다.', isVisible: true, createdAt: '2025-01-11' },
];

interface FaqListProps {
  onAdd: () => void;
  onView: (id: number) => void;
}

export function FaqList({ onAdd, onView }: FaqListProps) {
  const [faqs] = useState<FaqItem[]>(MOCK_FAQS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchKeyword || 
      faq.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <span className="faq-list__count-value">{filteredFaqs.length}</span>
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
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <div className="faq-list__category-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="faq-list__category-trigger"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="faq-list__category-text">
                {selectedCategory || '카테고리 선택'}
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
                  className={`faq-list__category-option ${!selectedCategory ? 'faq-list__category-option--selected' : ''}`}
                  onClick={() => { setSelectedCategory(null); setIsDropdownOpen(false); }}
                >
                  전체
                </button>
                {MOCK_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`faq-list__category-option ${selectedCategory === cat.name ? 'faq-list__category-option--selected' : ''}`}
                    onClick={() => { setSelectedCategory(cat.name); setIsDropdownOpen(false); }}
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
          <div className="faq-list__table-cell faq-list__table-cell--category">카테고리</div>
          <div className="faq-list__table-cell faq-list__table-cell--question">질문</div>
          <div className="faq-list__table-cell faq-list__table-cell--status">노출</div>
          <div className="faq-list__table-cell faq-list__table-cell--date">등록일</div>
        </div>

        <div className="faq-list__table-body">
          {filteredFaqs.map(faq => (
            <div 
              key={faq.id} 
              className="faq-list__table-row"
              onClick={() => onView(faq.id)}
            >
              <div className="faq-list__table-cell faq-list__table-cell--category">
                <span className="faq-list__category-badge">{faq.category}</span>
              </div>
              <div className="faq-list__table-cell faq-list__table-cell--question">
                {faq.question}
              </div>
              <div className="faq-list__table-cell faq-list__table-cell--status">
                <span className={`faq-list__status-badge ${faq.isVisible ? 'faq-list__status-badge--visible' : 'faq-list__status-badge--hidden'}`}>
                  {faq.isVisible ? '노출' : '숨김'}
                </span>
              </div>
              <div className="faq-list__table-cell faq-list__table-cell--date">
                {formatDate(faq.createdAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
