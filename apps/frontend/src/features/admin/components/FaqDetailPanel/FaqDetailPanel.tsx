import { useState, useEffect } from 'react';
import { ConfirmDialog } from '../ConfirmDialog';
import { CustomDropdown } from '../../../../components';
import './FaqDetailPanel.css';

interface FaqCategoryOption {
  id: number;
  name: string;
  sortOrder: number;
}

interface FaqDetailPanelProps {
  faqId: number;
  faqCategories: FaqCategoryOption[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

interface FaqDetail {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  categoryName: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export function FaqDetailPanel({ faqId, faqCategories, isOpen, onClose, onSaved, onSuccess, onError }: FaqDetailPanelProps) {
  const [faq, setFaq] = useState<FaqDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && faqId) {
      fetchFaq();
      setIsEditing(false);
    }
  }, [isOpen, faqId]);

  const fetchFaq = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`);
      if (response.ok) {
        const data = await response.json();
        setFaq(data);
        setEditTitle(data.title);
        setEditContent(data.content);
        setEditCategoryId(Number(data.categoryId));
        setEditIsVisible(data.isVisible);
      }
    } catch (error) {
      console.error('Failed to fetch FAQ:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (faq) {
      setEditTitle(faq.title);
      setEditContent(faq.content);
      setEditCategoryId(Number(faq.categoryId));
      setEditIsVisible(faq.isVisible);
    }
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    if (!editTitle.trim() || !editContent.trim()) {
      onError?.('제목과 내용을 입력해주세요.');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          categoryId: editCategoryId,
          isVisible: editIsVisible,
        }),
      });

      if (response.ok) {
        onSaved();
        onClose();
        onSuccess?.('내용이 수정되었습니다');
      } else {
        onError?.('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      onError?.('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      const response = await fetch(`/api/admin/faqs/${faqId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onSaved();
        onClose();
        onSuccess?.('FAQ가 삭제되었습니다');
      } else {
        onError?.('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
      onError?.('삭제에 실패했습니다.');
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
        className={`faq-panel-overlay ${isOpen ? 'faq-panel-overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`faq-panel ${isOpen ? 'faq-panel--open' : ''}`}>
        <div className="faq-panel__header">
          <h3 className="faq-panel__title">FAQ 상세</h3>
          <button 
            type="button" 
            className="faq-panel__close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="faq-panel__content">
          {isLoading ? (
            <div className="faq-panel__loading">로딩 중...</div>
          ) : faq ? (
            <>
              <div className="faq-panel__field">
                <label className="faq-panel__label">제목</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="faq-panel__input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="FAQ 제목을 입력하세요"
                  />
                ) : (
                  <div className="faq-panel__value">{faq.title}</div>
                )}
              </div>

              <div className="faq-panel__field">
                <label className="faq-panel__label">카테고리</label>
                {isEditing ? (
                  <CustomDropdown
                    options={faqCategories}
                    value={editCategoryId}
                    onChange={setEditCategoryId}
                  />
                ) : (
                  <div className="faq-panel__value">{faq.categoryName}</div>
                )}
              </div>

              <div className="faq-panel__field faq-panel__field--content">
                <label className="faq-panel__label">내용</label>
                {isEditing ? (
                  <textarea
                    className="faq-panel__textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="FAQ 내용을 입력하세요"
                  />
                ) : (
                  <div className="faq-panel__value faq-panel__value--content">
                    {faq.content}
                  </div>
                )}
              </div>

              <div className="faq-panel__field">
                <label className="faq-panel__label">노출 여부</label>
                {isEditing ? (
                  <div className="faq-panel__radio-group">
                    <label className="faq-panel__radio">
                      <input
                        type="radio"
                        name="faq-visibility"
                        checked={editIsVisible === true}
                        onChange={() => setEditIsVisible(true)}
                      />
                      <span className="faq-panel__radio-custom" />
                      <span className="faq-panel__radio-label">노출</span>
                    </label>
                    <label className="faq-panel__radio">
                      <input
                        type="radio"
                        name="faq-visibility"
                        checked={editIsVisible === false}
                        onChange={() => setEditIsVisible(false)}
                      />
                      <span className="faq-panel__radio-custom" />
                      <span className="faq-panel__radio-label">숨김</span>
                    </label>
                  </div>
                ) : (
                  <div className={`faq-panel__visibility-badge ${faq.isVisible ? 'faq-panel__visibility-badge--visible' : 'faq-panel__visibility-badge--hidden'}`}>
                    {faq.isVisible ? '노출' : '숨김'}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="faq-panel__meta">
                  <span>등록일: {formatDate(faq.createdAt)}</span>
                  <span>수정일: {formatDate(faq.updatedAt)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="faq-panel__loading">FAQ를 찾을 수 없습니다.</div>
          )}
        </div>

        <div className="faq-panel__footer">
          {isEditing ? (
            <>
              <button 
                type="button" 
                className="faq-panel__button faq-panel__button--delete"
                onClick={handleDeleteClick}
              >
                삭제
              </button>
              <button 
                type="button" 
                className="faq-panel__button faq-panel__button--cancel"
                onClick={handleCancelEdit}
              >
                취소
              </button>
              <button 
                type="button" 
                className="faq-panel__button faq-panel__button--save"
                onClick={handleSaveClick}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="faq-panel__button faq-panel__button--edit"
              onClick={handleEdit}
            >
              수정
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        title="내용을 저장하시겠습니까?"
        subtitle="저장 즉시 사용자에게 노출됩니다"
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowSaveConfirm(false)}
        onConfirm={handleSaveConfirm}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="FAQ를 삭제하시겠습니까?"
        subtitle="삭제된 FAQ는 복구할 수 없습니다"
        cancelText="취소"
        confirmText="삭제"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
