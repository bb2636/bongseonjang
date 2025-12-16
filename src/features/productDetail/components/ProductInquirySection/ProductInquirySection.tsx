import type { ProductInquiry } from '../../types/productInquiry';
import './ProductInquirySection.css';

interface ProductInquirySectionProps {
  inquiries: ProductInquiry[];
  onCreateInquiry: () => void;
}

function StatusLabel({ status }: { status: ProductInquiry['status'] }) {
  const isAnswered = status === 'answered';
  const label = isAnswered ? '답변완료' : '미답변';
  return (
    <span className={`inquiry-item__status ${isAnswered ? 'inquiry-item__status--answered' : ''}`}>
      {label}
    </span>
  );
}

function InquiryMeta({ inquiry }: { inquiry: ProductInquiry }) {
  return (
    <div className="inquiry-item__meta">
      <div className="inquiry-item__meta-left">
        <StatusLabel status={inquiry.status} />
        <span className="inquiry-item__category">/{inquiry.categoryLabel}</span>
      </div>
      <div className="inquiry-item__meta-right">
        <span className="inquiry-item__author">{inquiry.authorAlias}</span>
        <span className="inquiry-item__separator" aria-hidden />
        <span className="inquiry-item__date">{inquiry.createdAt}</span>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg className="inquiry-item__lock-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 7H11.5V5C11.5 3.067 9.933 1.5 8 1.5C6.067 1.5 4.5 3.067 4.5 5V7H3.5C3.224 7 3 7.224 3 7.5V13.5C3 13.776 3.224 14 3.5 14H12.5C12.776 14 13 13.776 13 13.5V7.5C13 7.224 12.776 7 12.5 7ZM5.5 5C5.5 3.619 6.619 2.5 8 2.5C9.381 2.5 10.5 3.619 10.5 5V7H5.5V5Z" fill="currentColor"/>
    </svg>
  );
}

function InquiryContent({ inquiry }: { inquiry: ProductInquiry }) {
  const isLocked = inquiry.isPrivate === true && inquiry.status !== 'answered';
  const isAnswered = inquiry.status === 'answered';

  return (
    <div className="inquiry-item__content-group">
      <div className="inquiry-item__row">
        {isLocked ? (
          <span className="inquiry-item__label inquiry-item__label--lock">
            <LockIcon />
          </span>
        ) : (
          <span className="inquiry-item__label inquiry-item__label--question">Q</span>
        )}
        <p className="inquiry-item__text">{inquiry.title}</p>
      </div>
      {isAnswered && inquiry.answer && (
        <div className="inquiry-item__row">
          <span className="inquiry-item__label inquiry-item__label--answer">A</span>
          <p className="inquiry-item__text">{inquiry.answer}</p>
        </div>
      )}
    </div>
  );
}

function InquiryItem({ inquiry }: { inquiry: ProductInquiry }) {
  return (
    <div className="inquiry-item">
      <InquiryMeta inquiry={inquiry} />
      <InquiryContent inquiry={inquiry} />
      <div className="inquiry-item__divider" />
    </div>
  );
}

export default function ProductInquirySection({ inquiries, onCreateInquiry }: ProductInquirySectionProps) {
  return (
    <section className="product-inquiry">
      <div className="product-inquiry__header">
        <button className="product-inquiry__verify" type="button" onClick={onCreateInquiry}>
          문의하기
        </button>
        <div className="product-inquiry__count">문의 {inquiries.length.toString().padStart(2, '0')}개</div>
      </div>

      <div className="product-inquiry__list">
        {inquiries.length === 0 ? (
          <div className="product-inquiry__empty">문의된 내용이 없습니다</div>
        ) : (
          inquiries.map((inquiry) => (
            <InquiryItem key={inquiry.id} inquiry={inquiry} />
          ))
        )}
      </div>
    </section>
  );
}
