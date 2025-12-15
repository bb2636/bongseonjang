import { useState, useEffect } from 'react';
import { AdminLayout } from '../layouts';
import { NoticeList, NoticeItem } from '../components';
import './AdminSupportPage.css';

type SupportTab = 'faq' | 'inquiry' | 'notice';

interface TabConfig {
  key: SupportTab;
  label: string;
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
  const [showForm, setShowForm] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);

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
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedNoticeId(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedNoticeId(null);
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
        if (showForm) {
          return (
            <NoticeForm 
              noticeId={selectedNoticeId} 
              onClose={handleFormClose} 
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
                setShowForm(false);
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
    </AdminLayout>
  );
}

interface NoticeFormProps {
  noticeId: number | null;
  onClose: () => void;
}

function NoticeForm({ noticeId, onClose }: NoticeFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'general' | 'important' | 'event'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = noticeId !== null;

  useEffect(() => {
    if (isEditMode) {
      fetchNotice();
    }
  }, [noticeId]);

  const fetchNotice = async () => {
    if (!noticeId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`);
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setType(data.type);
      }
    } catch (error) {
      console.error('Failed to fetch notice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const url = isEditMode 
        ? `/api/admin/notices/${noticeId}` 
        : '/api/admin/notices';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type }),
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

  const handleDelete = async () => {
    if (!noticeId) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onClose();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="notice-form">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <form className="notice-form" onSubmit={handleSubmit}>
      <div className="notice-form__header">
        <h3 className="notice-form__title">
          {isEditMode ? '공지사항 수정' : '공지사항 등록'}
        </h3>
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
        <select
          className="notice-form__select"
          value={type}
          onChange={(e) => setType(e.target.value as 'general' | 'important' | 'event')}
        >
          <option value="general">일반</option>
          <option value="important">중요</option>
          <option value="event">이벤트</option>
        </select>
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

      <div className="notice-form__actions">
        {isEditMode && (
          <button 
            type="button" 
            className="notice-form__delete-button"
            onClick={handleDelete}
          >
            삭제
          </button>
        )}
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
