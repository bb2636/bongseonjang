import { useState } from 'react';
import './InvestmentInfoList.css';

export interface InvestmentInfoItem {
  id: number;
  title: string;
  typeCode: string;
  typeName: string;
  isVisible: boolean;
  createdAt: string;
}

interface InvestmentInfoListProps {
  investmentInfos: InvestmentInfoItem[];
  totalCount: number;
  onView: (id: number) => void;
  onAdd: () => void;
  onSearch: (keyword: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function getTypeBadgeClass(typeCode: string): string {
  switch (typeCode) {
    case 'IMPORTANT':
      return 'investment-info-list__type-badge--important';
    case 'EVENT':
      return 'investment-info-list__type-badge--event';
    case 'NORMAL':
    default:
      return 'investment-info-list__type-badge--normal';
  }
}

export function InvestmentInfoList({ investmentInfos, totalCount, onView, onAdd, onSearch }: InvestmentInfoListProps) {
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(searchKeyword);
    }
  };

  return (
    <div className="investment-info-list">
      <div className="investment-info-list__header">
        <span className="investment-info-list__count">총 투자정보 수 · {String(totalCount).padStart(4, '0')}</span>
        <div className="investment-info-list__actions">
          <div className="investment-info-list__search">
            <svg 
              className="investment-info-list__search-icon" 
              viewBox="0 0 20 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              className="investment-info-list__search-input"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <button type="button" className="investment-info-list__add-button" onClick={onAdd}>
            투자정보 등록
          </button>
        </div>
      </div>

      <table className="investment-info-list__table">
        <thead>
          <tr>
            <th className="investment-info-list__th investment-info-list__th--date">등록일</th>
            <th className="investment-info-list__th investment-info-list__th--type">유형</th>
            <th className="investment-info-list__th investment-info-list__th--title">제목</th>
            <th className="investment-info-list__th investment-info-list__th--visibility">노출 여부</th>
            <th className="investment-info-list__th investment-info-list__th--action">관리</th>
          </tr>
        </thead>
        <tbody>
          {investmentInfos.length === 0 ? (
            <tr>
              <td colSpan={5} className="investment-info-list__empty">
                등록된 투자정보가 없습니다.
              </td>
            </tr>
          ) : (
            investmentInfos.map((info) => (
              <tr key={info.id} className={!info.isVisible ? 'investment-info-list__row--hidden' : ''}>
                <td className="investment-info-list__td investment-info-list__td--date">
                  {formatDate(info.createdAt)}
                </td>
                <td className="investment-info-list__td investment-info-list__td--type">
                  <span className={`investment-info-list__type-badge ${getTypeBadgeClass(info.typeCode)}`}>
                    {info.typeName}
                  </span>
                </td>
                <td className="investment-info-list__td investment-info-list__td--title">{info.title}</td>
                <td className="investment-info-list__td investment-info-list__td--visibility">
                  <span className={`investment-info-list__visibility-badge ${info.isVisible ? 'investment-info-list__visibility-badge--visible' : 'investment-info-list__visibility-badge--hidden'}`}>
                    {info.isVisible ? '노출' : '숨김'}
                  </span>
                </td>
                <td className="investment-info-list__td investment-info-list__td--action">
                  <button
                    type="button"
                    className="investment-info-list__view-button"
                    onClick={() => onView(info.id)}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
