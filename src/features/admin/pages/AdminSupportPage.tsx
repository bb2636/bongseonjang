import { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '../layouts';
import { NoticeList, NoticeItem, NoticeDetailPanel } from '../components';
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

const tabs: TabConfig[] = [
  { key: 'faq', label: 'FAQ' },
  { key: 'inquiry', label: '상품 문의' },
  { key: 'notice', label: '공지사항' },
];

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

  const fetchNoticeTypes = async () => {
    try {
      const response = await fetch('/api/admin/notices/types');
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
      const response = await fetch(`/api/admin/notices?${params.toString()}`);
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
    fetchNotices(searchKeyword);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'faq':
        return (
          <div className="admin-support__placeholder">
            <p>FAQ 관리 기능이 준비 중입니다.</p>
          </div>
        );
      case 'inquiry':
        return (
          <div className="admin-support__placeholder">
            <p>상품 문의 관리 기능이 준비 중입니다.</p>
          </div>
        );
      case 'notice':
        if (showAddForm) {
          return (
            <NoticeAddForm 
              noticeTypes={noticeTypes}
              onClose={handleAddFormClose} 
            />
          );
        }
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
    </AdminLayout>
  );
}

interface NoticeAddFormProps {
  noticeTypes: NoticeTypeOption[];
  onClose: () => void;
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

function NoticeAddForm({ noticeTypes, onClose }: NoticeAddFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [typeId, setTypeId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (noticeTypes.length > 0 && typeId === null) {
      const normalType = noticeTypes.find(t => t.code === 'NORMAL');
      setTypeId(normalType?.id ?? noticeTypes[0].id);
    }
  }, [noticeTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    if (!typeId) {
      alert('공지 유형을 선택해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, typeId, isVisible }),
      });

      if (response.ok) {
        onClose();
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
    <form className="notice-form" onSubmit={handleSubmit}>
      <div className="notice-form__header">
        <h3 className="notice-form__title">공지사항 등록</h3>
        <button 
          type="button" 
          className="notice-form__close-button"
          onClick={onClose}
        >
          닫기
        </button>
      </div>

      <div className="notice-form__field">
        <label className="notice-form__label">공지 유형</label>
        <FormCustomDropdown
          options={noticeTypes}
          value={typeId}
          onChange={setTypeId}
        />
      </div>

      <div className="notice-form__field">
        <label className="notice-form__label">제목</label>
        <input
          type="text"
          className="notice-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지사항 제목을 입력하세요"
        />
      </div>

      <div className="notice-form__field">
        <label className="notice-form__label">내용</label>
        <textarea
          className="notice-form__textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="공지사항 내용을 입력하세요"
          rows={10}
        />
      </div>

      <div className="notice-form__field">
        <label className="notice-form__label">노출 여부</label>
        <div className="notice-form__toggle-container">
          <button
            type="button"
            className={`notice-form__toggle ${isVisible ? 'notice-form__toggle--active' : ''}`}
            onClick={() => setIsVisible(!isVisible)}
          >
            <span className="notice-form__toggle-slider" />
          </button>
          <span className="notice-form__toggle-label">
            {isVisible ? '노출' : '숨김'}
          </span>
        </div>
      </div>

      <div className="notice-form__actions">
        <button 
          type="button" 
          className="notice-form__cancel-button"
          onClick={onClose}
        >
          취소
        </button>
        <button 
          type="submit" 
          className="notice-form__submit-button"
          disabled={isSaving}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
