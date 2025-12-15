import { useState } from 'react';
import './NoticeList.css';

export interface NoticeItem {
  id: number;
  title: string;
  typeCode: string;
  typeName: string;
  createdAt: string;
}

interface NoticeListProps {
  notices: NoticeItem[];
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
      return 'notice-list__type-badge--important';
    case 'EVENT':
      return 'notice-list__type-badge--event';
    case 'NORMAL':
    default:
      return 'notice-list__type-badge--normal';
  }
}

export function NoticeList({ notices, totalCount, onView, onAdd, onSearch }: NoticeListProps) {
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
    <div className="notice-list">
      <div className="notice-list__header">
        <span className="notice-list__count">총 공지 수 · {String(totalCount).padStart(4, '0')}</span>
        <div className="notice-list__actions">
          <div className="notice-list__search">
            <svg 
              className="notice-list__search-icon" 
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
              className="notice-list__search-input"
              placeholder="검색어를 입력하세요"
              value={searchKeyword}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <button type="button" className="notice-list__add-button" onClick={onAdd}>
            공지사항 등록
          </button>
        </div>
      </div>

      <table className="notice-list__table">
        <thead>
          <tr>
            <th className="notice-list__th notice-list__th--date">공지 등록일</th>
            <th className="notice-list__th notice-list__th--type">공지 유형</th>
            <th className="notice-list__th notice-list__th--title">공지 제목</th>
            <th className="notice-list__th notice-list__th--action">관리</th>
          </tr>
        </thead>
        <tbody>
          {notices.length === 0 ? (
            <tr>
              <td colSpan={4} className="notice-list__empty">
                등록된 공지사항이 없습니다.
              </td>
            </tr>
          ) : (
            notices.map((notice) => (
              <tr key={notice.id}>
                <td className="notice-list__td notice-list__td--date">
                  {formatDate(notice.createdAt)}
                </td>
                <td className="notice-list__td notice-list__td--type">
                  <span className={`notice-list__type-badge ${getTypeBadgeClass(notice.typeCode)}`}>
                    {notice.typeName}
                  </span>
                </td>
                <td className="notice-list__td notice-list__td--title">{notice.title}</td>
                <td className="notice-list__td notice-list__td--action">
                  <button
                    type="button"
                    className="notice-list__view-button"
                    onClick={() => onView(notice.id)}
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
