import { useState, useEffect } from 'react';
import { CustomDropdown } from '../../../../components';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { API_BASE_URL } from '@/shared/config/apiConfig';
import './InvestmentInfoDetailPanel.css';

interface InvestmentInfoTypeOption {
  id: number;
  code: string;
  name: string;
}

interface InvestmentInfoDetailPanelProps {
  investmentInfoId: number;
  investmentInfoTypes: InvestmentInfoTypeOption[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface InvestmentInfoDetail {
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

export function InvestmentInfoDetailPanel({ investmentInfoId, investmentInfoTypes, isOpen, onClose, onSaved }: InvestmentInfoDetailPanelProps) {
  useBodyScrollLock(isOpen);
  const [investmentInfo, setInvestmentInfo] = useState<InvestmentInfoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTypeId, setEditTypeId] = useState<number | null>(null);
  const [editIsVisible, setEditIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && investmentInfoId) {
      fetchInvestmentInfo();
      setIsEditing(false);
    }
  }, [isOpen, investmentInfoId]);

  const fetchInvestmentInfo = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/investment-infos/${investmentInfoId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        const data = await response.json();
        setInvestmentInfo(data);
        setEditTitle(data.title);
        setEditContent(data.content);
        setEditTypeId(Number(data.typeId));
        setEditIsVisible(data.isVisible);
      }
    } catch (error) {
      console.error('Failed to fetch investment info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (investmentInfo) {
      setEditTitle(investmentInfo.title);
      setEditContent(investmentInfo.content);
      setEditTypeId(Number(investmentInfo.typeId));
      setEditIsVisible(investmentInfo.isVisible);
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
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/investment-infos/${investmentInfoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          typeId: editTypeId,
          isVisible: editIsVisible,
        }),
      });

      if (response.ok) {
        await fetchInvestmentInfo();
        setIsEditing(false);
        onSaved();
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to save investment info:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/admin/investment-infos/${investmentInfoId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) {
        onClose();
        onSaved();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete investment info:', error);
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
        className={`investment-info-panel-overlay ${isOpen ? 'investment-info-panel-overlay--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`investment-info-panel ${isOpen ? 'investment-info-panel--open' : ''}`}>
        <div className="investment-info-panel__header">
          <h3 className="investment-info-panel__title">투자정보 상세</h3>
          <button 
            type="button" 
            className="investment-info-panel__close-button"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.5 5.5L5.5 16.5M5.5 5.5L16.5 16.5" stroke="#101112" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="investment-info-panel__content">
          {isLoading ? (
            <div className="investment-info-panel__loading">로딩 중...</div>
          ) : investmentInfo ? (
            <>
              <div className="investment-info-panel__field">
                <label className="investment-info-panel__label">유형</label>
                {isEditing ? (
                  <CustomDropdown
                    options={investmentInfoTypes}
                    value={editTypeId}
                    onChange={setEditTypeId}
                  />
                ) : (
                  <div className="investment-info-panel__value">{investmentInfo.typeName}</div>
                )}
              </div>

              <div className="investment-info-panel__field">
                <label className="investment-info-panel__label">제목</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="investment-info-panel__input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="투자정보 제목을 입력하세요"
                  />
                ) : (
                  <div className="investment-info-panel__value">{investmentInfo.title}</div>
                )}
              </div>

              <div className="investment-info-panel__field investment-info-panel__field--content">
                <label className="investment-info-panel__label">내용</label>
                {isEditing ? (
                  <textarea
                    className="investment-info-panel__textarea"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="투자정보 내용을 입력하세요"
                  />
                ) : (
                  <div className="investment-info-panel__value investment-info-panel__value--content">
                    {investmentInfo.content}
                  </div>
                )}
              </div>

              <div className="investment-info-panel__field">
                <label className="investment-info-panel__label">노출 여부</label>
                {isEditing ? (
                  <div className="investment-info-panel__radio-group">
                    <label className="investment-info-panel__radio">
                      <input
                        type="radio"
                        name="visibility"
                        checked={editIsVisible === true}
                        onChange={() => setEditIsVisible(true)}
                      />
                      <span className="investment-info-panel__radio-custom" />
                      <span className="investment-info-panel__radio-label">노출</span>
                    </label>
                    <label className="investment-info-panel__radio">
                      <input
                        type="radio"
                        name="visibility"
                        checked={editIsVisible === false}
                        onChange={() => setEditIsVisible(false)}
                      />
                      <span className="investment-info-panel__radio-custom" />
                      <span className="investment-info-panel__radio-label">숨김</span>
                    </label>
                  </div>
                ) : (
                  <div className={`investment-info-panel__visibility-badge ${investmentInfo.isVisible ? 'investment-info-panel__visibility-badge--visible' : 'investment-info-panel__visibility-badge--hidden'}`}>
                    {investmentInfo.isVisible ? '노출' : '숨김'}
                  </div>
                )}
              </div>

              {!isEditing && (
                <div className="investment-info-panel__meta">
                  <span>등록일: {formatDate(investmentInfo.createdAt)}</span>
                  <span>수정일: {formatDate(investmentInfo.updatedAt)}</span>
                </div>
              )}
            </>
          ) : (
            <div className="investment-info-panel__loading">투자정보를 찾을 수 없습니다.</div>
          )}
        </div>

        <div className="investment-info-panel__footer">
          {isEditing ? (
            <>
              <button 
                type="button" 
                className="investment-info-panel__button investment-info-panel__button--delete"
                onClick={handleDelete}
              >
                삭제
              </button>
              <button 
                type="button" 
                className="investment-info-panel__button investment-info-panel__button--cancel"
                onClick={handleCancelEdit}
              >
                취소
              </button>
              <button 
                type="button" 
                className="investment-info-panel__button investment-info-panel__button--save"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </>
          ) : (
            <button 
              type="button" 
              className="investment-info-panel__button investment-info-panel__button--edit"
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
