import { useState, useEffect } from 'react';
import { TabType, CategoryItem, CategoryFormData } from './useCategoryManagement';
import './CategoryManagement.css';

interface CategoryFormModalProps {
  isOpen: boolean;
  activeTab: TabType;
  editingCategory: CategoryItem | null;
  onSubmit: (formData: CategoryFormData) => Promise<void>;
  onClose: () => void;
}

export function CategoryFormModal({
  isOpen,
  activeTab,
  editingCategory,
  onSubmit,
  onClose,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = editingCategory !== null;
  const showActiveToggle = activeTab !== 'exposure';

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setName(editingCategory.name);
        setSortOrder(editingCategory.sortOrder);
        setIsActive('isActive' in editingCategory ? editingCategory.isActive : true);
      } else {
        setName('');
        setSortOrder(0);
        setIsActive(true);
      }
      setSubmitError(null);
    }
  }, [isOpen, editingCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setSubmitError('이름을 입력해주세요');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ name: name.trim(), sortOrder, isActive });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="category-form-modal__overlay" onClick={onClose}>
      <div className="category-form-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="category-form-modal__title">
          {isEditing ? '카테고리 수정' : '카테고리 추가'}
        </h2>
        <form className="category-form-modal__form" onSubmit={handleSubmit}>
          <div className="category-form-modal__field">
            <label className="category-form-modal__label">이름</label>
            <input
              type="text"
              className="category-form-modal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름을 입력하세요"
            />
          </div>
          <div className="category-form-modal__field">
            <label className="category-form-modal__label">정렬순서</label>
            <input
              type="number"
              className="category-form-modal__input"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            />
          </div>
          {showActiveToggle && (
            <div className="category-form-modal__field">
              <label className="category-form-modal__label">활성 상태</label>
              <div
                className={`category-form-modal__toggle ${isActive ? 'category-form-modal__toggle--active' : ''}`}
                onClick={() => setIsActive(!isActive)}
              >
                <div className="category-form-modal__toggle-knob" />
              </div>
            </div>
          )}
          {submitError && (
            <div className="category-form-modal__error">{submitError}</div>
          )}
          <div className="category-form-modal__actions">
            <button type="button" className="category-form-modal__cancel" onClick={onClose} disabled={isSubmitting}>
              취소
            </button>
            <button type="submit" className="category-form-modal__submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : isEditing ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
