import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../layouts';
import { NoticeList, NoticeItem, NoticeDetailPanel, ConfirmDialog, Snackbar, FaqList, FaqDetailPanel, InquiryList, InquiryDetailPanel } from '../components';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import './AdminSupportPage.css';

type SupportTab = 'faq' | 'inquiry' | 'notice';

interface TabConfig {
  key: SupportTab;
  label: string;
}

interface NoticeTypeOption {
  id: number;
  code: string;
  name: string;
}

interface FaqCategoryOption {
  id: number;
  name: string;
  sortOrder: number;
}

const tabs: TabConfig[] = [
  { key: 'faq', label: 'FAQ' },
  { key: 'inquiry', label: '상품 문의' },
  { key: 'notice', label: '공지사항' },
];

interface SnackbarState {
  isOpen: boolean;
  title: string;
  details?: string[];
}

export function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<SupportTab>('notice');
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [noticeTypes, setNoticeTypes] = useState<NoticeTypeOption[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({ isOpen: false, title: '' });

  const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);
  const [isFaqPanelOpen, setIsFaqPanelOpen] = useState(false);
  const [faqCategories, setFaqCategories] = useState<FaqCategoryOption[]>([]);
  const [faqRefreshTrigger, setFaqRefreshTrigger] = useState(0);
  const [showFaqAddForm, setShowFaqAddForm] = useState(false);

  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [isInquiryPanelOpen, setIsInquiryPanelOpen] = useState(false);
  const [inquiryRefreshTrigger, setInquiryRefreshTrigger] = useState(0);

  const fetchNoticeTypes = async () => {
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/notices/types`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNoticeTypes(data);
      }
    } catch (error) {
      console.error('Failed to fetch notice types:', error);
    }
  };

  const fetchNotices = async (keyword = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) {
        params.append('keyword', keyword);
      }
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/notices?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setNotices(data.notices);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticeTypes();
  }, []);

  useEffect(() => {
    if (activeTab === 'notice') {
      fetchNotices(searchKeyword);
    }
  }, [activeTab]);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchNotices(keyword);
  };

  const handleView = (id: number) => {
    setSelectedNoticeId(id);
    setIsPanelOpen(true);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setShowAddForm(true);
    setIsPanelOpen(false);
    setSelectedNoticeId(null);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setSelectedNoticeId(null);
  };

  const handlePanelSaved = () => {
    fetchNotices(searchKeyword);
  };

  const handleAddFormClose = () => {
    setShowAddForm(false);
  };

  const handleAddFormSuccess = () => {
    setShowAddForm(false);
    fetchNotices(searchKeyword);
    setSnackbar({
      isOpen: true,
      title: '공지사항이 등록되었습니다',
    });
  };

  const handleFaqView = (id: number) => {
    setSelectedFaqId(id);
    setIsFaqPanelOpen(true);
  };

  const handleFaqPanelClose = () => {
    setIsFaqPanelOpen(false);
    setSelectedFaqId(null);
  };

  const handleFaqPanelSaved = () => {
    setFaqRefreshTrigger(prev => prev + 1);
  };

  const handleFaqSuccess = (message: string) => {
    setSnackbar({
      isOpen: true,
      title: message,
    });
  };

  const handleFaqError = (message: string) => {
    setSnackbar({
      isOpen: true,
      title: message,
    });
  };

  const handleFaqCategoriesLoaded = (categories: FaqCategoryOption[]) => {
    setFaqCategories(categories);
  };

  const handleFaqAdd = () => {
    setShowFaqAddForm(true);
    setIsFaqPanelOpen(false);
    setSelectedFaqId(null);
  };

  const handleFaqAddFormClose = () => {
    setShowFaqAddForm(false);
  };

  const handleFaqAddFormSuccess = () => {
    setShowFaqAddForm(false);
    setFaqRefreshTrigger(prev => prev + 1);
    setSnackbar({
      isOpen: true,
      title: 'FAQ가 등록되었습니다',
    });
  };

  const handleInquiryView = (id: number) => {
    setSelectedInquiryId(id);
    setIsInquiryPanelOpen(true);
  };

  const handleInquiryPanelClose = () => {
    setIsInquiryPanelOpen(false);
    setSelectedInquiryId(null);
  };

  const handleInquiryPanelSaved = () => {
    setInquiryRefreshTrigger(prev => prev + 1);
  };

  const handleInquirySuccess = (message: string) => {
    setSnackbar({
      isOpen: true,
      title: message,
    });
  };

  const handleInquiryError = (message: string) => {
    setSnackbar({
      isOpen: true,
      title: message,
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <FaqList
            onAdd={handleFaqAdd}
            onView={handleFaqView}
            onCategoriesLoaded={handleFaqCategoriesLoaded}
            refreshTrigger={faqRefreshTrigger}
          />
        );
      case 'inquiry':
        return (
          <InquiryList
            onView={handleInquiryView}
            refreshTrigger={inquiryRefreshTrigger}
          />
        );
      case 'notice':
        if (isLoading) {
          return (
            <div className="admin-support__placeholder">
              <p>로딩 중...</p>
            </div>
          );
        }
        return (
          <NoticeList
            notices={notices}
            totalCount={totalCount}
            onView={handleView}
            onAdd={handleAdd}
            onSearch={handleSearch}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout hidePageHeader>
      <div className="admin-support">
        <nav className="admin-support__tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-support__tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.key);
                setShowAddForm(false);
                setIsPanelOpen(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-support__content">
          {renderTabContent()}
        </div>
      </div>

      {selectedNoticeId && (
        <NoticeDetailPanel
          noticeId={selectedNoticeId}
          noticeTypes={noticeTypes}
          isOpen={isPanelOpen}
          onClose={handlePanelClose}
          onSaved={handlePanelSaved}
        />
      )}

      {selectedFaqId && (
        <FaqDetailPanel
          faqId={selectedFaqId}
          faqCategories={faqCategories}
          isOpen={isFaqPanelOpen}
          onClose={handleFaqPanelClose}
          onSaved={handleFaqPanelSaved}
          onSuccess={handleFaqSuccess}
          onError={handleFaqError}
        />
      )}

      <InquiryDetailPanel
        inquiryId={selectedInquiryId ?? 0}
        isOpen={isInquiryPanelOpen && selectedInquiryId !== null}
        onClose={handleInquiryPanelClose}
        onSaved={handleInquiryPanelSaved}
        onSuccess={handleInquirySuccess}
        onError={handleInquiryError}
      />

      {showAddForm && (
        <NoticeAddForm 
          noticeTypes={noticeTypes}
          onClose={handleAddFormClose}
          onSuccess={handleAddFormSuccess}
        />
      )}

      {showFaqAddForm && (
        <FaqAddForm 
          faqCategories={faqCategories}
          onClose={handleFaqAddFormClose}
          onSuccess={handleFaqAddFormSuccess}
        />
      )}

      <Snackbar
        isOpen={snackbar.isOpen}
        title={snackbar.title}
        details={snackbar.details}
        onClose={() => setSnackbar({ isOpen: false, title: '' })}
      />
    </AdminLayout>
  );
}

interface NoticeAddFormProps {
  noticeTypes: NoticeTypeOption[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormCustomDropdownProps {
  options: NoticeTypeOption[];
  value: number | null;
  onChange: (id: number) => void;
}

function FormCustomDropdown({ options, value, onChange }: FormCustomDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: number) => {
    onChange(optionId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="notice-form__dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="notice-form__dropdown-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="notice-form__dropdown-text">
          {selectedOption?.name || '선택하세요'}
        </span>
        <svg 
          className={`notice-form__dropdown-arrow ${isDropdownOpen ? 'notice-form__dropdown-arrow--open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="notice-form__dropdown-menu">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`notice-form__dropdown-option ${option.id === value ? 'notice-form__dropdown-option--selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NoticeAddForm({ noticeTypes, onClose, onSuccess }: NoticeAddFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [typeId, setTypeId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (noticeTypes.length > 0 && typeId === null) {
      const normalType = noticeTypes.find(t => t.code === 'NORMAL');
      setTypeId(normalType?.id ?? noticeTypes[0].id);
    }
  }, [noticeTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!typeId) {
      alert('공지 유형을 선택해주세요.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, typeId, isVisible }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save notice:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="notice-modal-overlay">
      <form className="notice-modal" onSubmit={handleSubmit}>
        <div className="notice-modal__header">
          <h3 className="notice-modal__title">공지사항 등록</h3>
          <button 
            type="button" 
            className="notice-modal__close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="notice-modal__content">
          <div className="notice-modal__field">
            <label className="notice-modal__label">제목</label>
            <div className="notice-modal__input-wrapper">
              <input
                type="text"
                className="notice-modal__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            </div>
          </div>

          <div className="notice-modal__field">
            <label className="notice-modal__label">유형</label>
            <div className="notice-modal__input-wrapper">
              <FormCustomDropdown
                options={noticeTypes}
                value={typeId}
                onChange={setTypeId}
              />
            </div>
          </div>

          <div className="notice-modal__field notice-modal__field--content">
            <label className="notice-modal__label">내용</label>
            <div className="notice-modal__input-wrapper notice-modal__input-wrapper--content">
              <textarea
                className="notice-modal__textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지 상세 내용을 입력하세요"
              />
              <span className="notice-modal__char-count">0/500</span>
            </div>
          </div>

          <div className="notice-modal__field">
            <label className="notice-modal__label">노출 여부</label>
            <div className="notice-modal__radio-group">
              <label className="notice-modal__radio">
                <input
                  type="radio"
                  name="visibility"
                  checked={isVisible}
                  onChange={() => setIsVisible(true)}
                />
                <span className="notice-modal__radio-custom" />
                <span className="notice-modal__radio-label">노출</span>
              </label>
              <label className="notice-modal__radio">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isVisible}
                  onChange={() => setIsVisible(false)}
                />
                <span className="notice-modal__radio-custom" />
                <span className="notice-modal__radio-label">숨김</span>
              </label>
            </div>
          </div>
        </div>

        <div className="notice-modal__footer">
          <button 
            type="button" 
            className="notice-modal__cancel-button"
            onClick={onClose}
          >
            초기화
          </button>
          <button 
            type="submit" 
            className="notice-modal__submit-button"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="새로운 공지를 등록하시겠습니까?"
        subtitle="저장 즉시 사용자에게 노출됩니다"
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}

interface FaqAddFormProps {
  faqCategories: FaqCategoryOption[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FaqFormCategoryDropdownProps {
  options: FaqCategoryOption[];
  value: number | null;
  onChange: (id: number) => void;
}

function FaqFormCategoryDropdown({ options, value, onChange }: FaqFormCategoryDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: number) => {
    onChange(optionId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="notice-form__dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="notice-form__dropdown-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="notice-form__dropdown-text">
          {selectedOption?.name || '카테고리 선택'}
        </span>
        <svg 
          className={`notice-form__dropdown-arrow ${isDropdownOpen ? 'notice-form__dropdown-arrow--open' : ''}`}
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#0C0C0C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {isDropdownOpen && (
        <div className="notice-form__dropdown-menu">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`notice-form__dropdown-option ${option.id === value ? 'notice-form__dropdown-option--selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FaqAddForm({ faqCategories, onClose, onSuccess }: FaqAddFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (faqCategories.length > 0 && categoryId === null) {
      setCategoryId(faqCategories[0].id);
    }
  }, [faqCategories, categoryId]);

  const handleReset = () => {
    setTitle('');
    setContent('');
    if (faqCategories.length > 0) {
      setCategoryId(faqCategories[0].id);
    }
    setIsVisible(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!categoryId) {
      alert('카테고리를 선택해주세요.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, categoryId, isVisible }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const maxContentLength = 800;

  return (
    <div className="notice-modal-overlay">
      <form className="notice-modal" onSubmit={handleSubmit}>
        <div className="notice-modal__header">
          <h3 className="notice-modal__title">FAQ 등록</h3>
          <button 
            type="button" 
            className="notice-modal__close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="notice-modal__content">
          <div className="notice-modal__field">
            <label className="notice-modal__label">제목</label>
            <div className="notice-modal__input-wrapper">
              <input
                type="text"
                className="notice-modal__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
              />
            </div>
          </div>

          <div className="notice-modal__field">
            <label className="notice-modal__label">카테고리</label>
            <div className="notice-modal__input-wrapper">
              <FaqFormCategoryDropdown
                options={faqCategories}
                value={categoryId}
                onChange={setCategoryId}
              />
            </div>
          </div>

          <div className="notice-modal__field notice-modal__field--content">
            <label className="notice-modal__label">내용</label>
            <div className="notice-modal__input-wrapper notice-modal__input-wrapper--content">
              <textarea
                className="notice-modal__textarea"
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= maxContentLength) {
                    setContent(e.target.value);
                  }
                }}
                placeholder="고객에게 보여질 답변 내용을 입력하세요"
              />
              <span className="notice-modal__char-count">{content.length}/{maxContentLength}</span>
            </div>
          </div>

          <div className="notice-modal__field">
            <label className="notice-modal__label">노출 여부</label>
            <div className="notice-modal__radio-group">
              <label className="notice-modal__radio">
                <input
                  type="radio"
                  name="faq-visibility"
                  checked={isVisible}
                  onChange={() => setIsVisible(true)}
                />
                <span className="notice-modal__radio-custom" />
                <span className="notice-modal__radio-label">노출</span>
              </label>
              <label className="notice-modal__radio">
                <input
                  type="radio"
                  name="faq-visibility"
                  checked={!isVisible}
                  onChange={() => setIsVisible(false)}
                />
                <span className="notice-modal__radio-custom" />
                <span className="notice-modal__radio-label">숨김</span>
              </label>
            </div>
          </div>
        </div>

        <div className="notice-modal__footer">
          <button 
            type="button" 
            className="notice-modal__cancel-button"
            onClick={handleReset}
          >
            초기화
          </button>
          <button 
            type="submit" 
            className="notice-modal__submit-button"
            disabled={isSaving}
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="새로운 FAQ를 등록하시겠습니까?"
        subtitle="저장 즉시 사용자에게 노출됩니다"
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSave}
      />
    </div>
  );
}
