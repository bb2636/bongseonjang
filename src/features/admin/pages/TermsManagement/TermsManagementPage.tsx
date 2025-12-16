import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../layouts';
import './TermsManagementPage.css';
import type { TermsContent, TermsType } from '../../../terms/types/terms';
import { fetchAdminTerms, saveTerms } from '../../../terms/api/termsApi';

const DEFAULT_TERMS_TYPE: TermsType = 'SERVICE';

export function TermsManagementPage() {
  const [selectedType, setSelectedType] = useState<TermsType>(DEFAULT_TERMS_TYPE);
  const [terms, setTerms] = useState<TermsContent | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formattedUpdatedAt = useMemo(() => {
    if (!terms) return '업데이트 예정';
    return new Date(terms.updatedAt).toLocaleString();
  }, [terms]);

  const loadTerms = async (type: TermsType) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminTerms(type);
      const latestTerms = response.terms[0] ?? null;
      setTerms(latestTerms ?? null);
      setTitle(latestTerms?.title ?? '');
      setContent(latestTerms?.content ?? '');
      setIsActive(latestTerms?.isActive ?? true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '약관을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTerms(selectedType);
  }, [selectedType]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const saved = await saveTerms({
        id: terms?.id,
        type: selectedType,
        title,
        content,
        isActive,
      });
      setTerms(saved);
      setMessage('약관이 저장되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '약관 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout
      title="약관 관리"
      description="서비스 이용약관을 최신 상태로 유지하세요"
    >
      <div className="terms-management">
        <div className="terms-management__header">
          <div className="terms-management__selector">
            <label htmlFor="termsType" className="terms-management__label">약관 유형</label>
            <select
              id="termsType"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value as TermsType)}
              className="terms-management__select"
            >
              <option value="SERVICE">서비스 이용약관</option>
            </select>
          </div>
          <div className="terms-management__status">
            <span className="terms-management__updated-label">최근 업데이트</span>
            <span className="terms-management__updated-value">{formattedUpdatedAt}</span>
          </div>
        </div>

        <form className="terms-management__card" onSubmit={handleSubmit}>
          {isLoading && <p className="terms-management__helper">약관 정보를 불러오는 중입니다...</p>}
          {error && <p className="terms-management__error">{error}</p>}
          {message && <p className="terms-management__success">{message}</p>}

          <label htmlFor="termsTitle" className="terms-management__label">제목</label>
          <input
            id="termsTitle"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="terms-management__input"
            placeholder="서비스 이용약관 제목을 입력하세요"
            required
            disabled={isLoading || isSaving}
          />

          <label htmlFor="termsContent" className="terms-management__label">약관 내용</label>
          <textarea
            id="termsContent"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="terms-management__textarea"
            placeholder="약관 본문을 입력하세요"
            rows={16}
            required
            disabled={isLoading || isSaving}
          />

          <div className="terms-management__footer">
            <label className="terms-management__toggle">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                disabled={isLoading || isSaving}
              />
              <span>사용자에게 노출</span>
            </label>

            <button
              type="submit"
              className="terms-management__save"
              disabled={isLoading || isSaving}
            >
              {isSaving ? '저장 중...' : terms ? '약관 업데이트' : '약관 등록'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
