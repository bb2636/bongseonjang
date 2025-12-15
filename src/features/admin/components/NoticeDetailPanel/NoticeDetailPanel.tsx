import { useState, useEffect, useRef } from 'react';
import './NoticeDetailPanel.css';

interface NoticeTypeOption {
  id: number;
  code: string;
  name: string;
}

interface NoticeDetailPanelProps {
  noticeId: number;
  noticeTypes: NoticeTypeOption[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  typeId: number;
  typeCode: string;
  typeName: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomDropdownProps {
  options: NoticeTypeOption[];
  value: number | null;
  onChange: (id: number) => void;
}

function CustomDropdown({ options, value, onChange }: CustomDropdownProps) {
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
    <div className="custom-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="custom-dropdown__trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="custom-dropdown__selected-text">
          {selectedOption?.name || '선택하세요'}
        </span>
        <svg 
          className={`custom-dropdown__arrow ${isDropdownOpen ? 'custom-dropdown__arrow--open' : ''}`}
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
        <div className="custom-dropdown__menu">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`custom-dropdown__option ${option.id === value ? 'custom-dropdown__option--selected' : ''}`}
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

export function NoticeDetailPanel({ noticeId, noticeTypes, isOpen, onClose, onSaved }: NoticeDetailPanelProps) {
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTypeId, setEditTypeId] = useState<number | null>(null);
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && noticeId) {
      fetchNotice();
      setIsEditing(false);
    }
  }, [isOpen, noticeId]);

  const fetchNotice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`);
      if (response.ok) {
        const data = await response.json();
        setNotice(data);
        setEditTitle(data.title);
        setEditContent(data.content);
        setEditTypeId(Number(data.typeId));
        setEditIsVisible(data.isVisible);
      }
    } catch (error) {
      console.error('Failed to fetch notice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (notice) {
      setEditTitle(notice.title);
      setEditContent(notice.content);
      setEditTypeId(Number(notice.typeId));
      setEditIsVisible(notice.isVisible);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          typeId: editTypeId,
          isVisible: editIsVisible,
        }),
      });

      if (response.ok) {
        await fetchNotice();
        setIsEditing(false);
        onSaved();
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
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/notices/${noticeId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onClose();
        onSaved();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <>
      <div 
        className={`notice-panel-overlay ${isOpen ? 'notice-panel-overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`notice-panel ${isOpen ? 'notice-panel--open' : ''}`}>
        <div className="notice-panel__header">
          <h3 className="notice-panel__title">공지사항 상세</h3>
          <button 
            type="button" 
            className="notice-panel__close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="notice-panel__content">
          {isLoading ? (
            <div className="notice-panel__loading">로딩 중...</div>
          ) : notice ? (
            <>
              <div className="notice-panel__field">
                <label className="notice-panel__label">공지 유형</label>
                {isEditing ? (
                  <CustomDropdown
                    options={noticeTypes}
                    value={editTypeId}
                    onChange={setEditTypeId}
                  />
                ) : (
                  <div className="notice-panel__value">{notice.typeName}</div>
                )}
              </div>

              <div className="notice-panel__field">
                <label className="notice-panel__label">제목</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="notice-panel__input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="공지사항 제목을 입력하세요"
                  />
                ) : (
                  <div className="notice-panel__value">{notice.title}</div>
                )}
              </div>

              <div className="notice-panel__field notice-panel__field--content">
                <label className="notice-panel__label">내용</label>
                {isEditing ? (
                  <textarea
                    className="notice-panel__textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="공지사항 내용을 입력하세요"
                  />
                ) : (
                  <div className="notice-panel__value notice-panel__value--content">
                    {notice.content}
                  </div>
                )}
              </div>

              <div className="notice-panel__field">
                <label className="notice-panel__label">노출 여부</label>
                {isEditing ? (
                  <div className="notice-panel__toggle-container">
                    <button
                      type="button"
                      className={`notice-panel__toggle ${editIsVisible ? 'notice-panel__toggle--active' : ''}`}
                      onClick={() => setEditIsVisible(!editIsVisible)}
                    >
                      <span className="notice-panel__toggle-slider" />
                    </button>
                    <span className="notice-panel__toggle-label">
                      {editIsVisible ? '노출' : '숨김'}
                    </span>
                  </div>
                ) : (
                  <div className={`notice-panel__visibility-badge ${notice.isVisible ? 'notice-panel__visibility-badge--visible' : 'notice-panel__visibility-badge--hidden'}`}>
                    {notice.isVisible ? '노출' : '숨김'}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="notice-panel__meta">
                  <span>등록일: {formatDate(notice.createdAt)}</span>
                  <span>수정일: {formatDate(notice.updatedAt)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="notice-panel__loading">공지사항을 찾을 수 없습니다.</div>
          )}
        </div>

        <div className="notice-panel__footer">
          {isEditing ? (
            <>
              <button 
                type="button" 
                className="notice-panel__button notice-panel__button--delete"
                onClick={handleDelete}
              >
                삭제
              </button>
              <button 
                type="button" 
                className="notice-panel__button notice-panel__button--cancel"
                onClick={handleCancelEdit}
              >
                취소
              </button>
              <button 
                type="button" 
                className="notice-panel__button notice-panel__button--save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="notice-panel__button notice-panel__button--edit"
              onClick={handleEdit}
            >
              수정
            </button>
          )}
        </div>
      </div>
    </>
  );
}
