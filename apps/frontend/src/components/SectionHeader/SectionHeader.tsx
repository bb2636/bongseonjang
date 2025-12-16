import './SectionHeader.css';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
  viewAllText?: string;
}

export default function SectionHeader({
  title,
  onViewAll,
  viewAllText = "전체보기",
}: SectionHeaderProps) {
  return (
    <div className="section-header">
      <h2 className="section-header__title">{title}</h2>
      {onViewAll && (
        <button
          type="button"
          className="section-header__view-all"
          onClick={onViewAll}
        >
          <span>{viewAllText}</span>
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.5 2.5L8.5 6.5L4.5 10.5"
              stroke="#3B9BD5"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
