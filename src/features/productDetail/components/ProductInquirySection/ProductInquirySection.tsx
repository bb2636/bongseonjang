import type { ProductInquiry } from '../../types/productInquiry';
import './ProductInquirySection.css';

interface ProductInquirySectionProps {
  inquiries: ProductInquiry[];
  onVerifyEmail: () => void;
}

function StatusBadge({ status }: { status: ProductInquiry['status'] }) {
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
        <StatusBadge status={inquiry.status} />
        <span className="inquiry-item__category">{inquiry.categoryLabel}</span>
      </div>
      <div className="inquiry-item__meta-right">
        <span className="inquiry-item__author">{inquiry.authorAlias}</span>
        <span className="inquiry-item__separator" aria-hidden>
          •
        </span>
        <span className="inquiry-item__date">{inquiry.createdAt}</span>
      </div>
    </div>
  );
}

function InquiryContent({ inquiry }: { inquiry: ProductInquiry }) {
  const isLocked = inquiry.isPrivate === true;
  return (
    <div className="inquiry-item__content-group">
      <div className="inquiry-item__row">
        {isLocked ? <span className="inquiry-item__icon">🔒</span> : <span className="inquiry-item__icon inquiry-item__icon--question">Q</span>}
        <p className="inquiry-item__text">{inquiry.title}</p>
      </div>
      {inquiry.answer && (
        <div className="inquiry-item__row inquiry-item__row--answer">
          <span className="inquiry-item__icon inquiry-item__icon--answer">A</span>
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

export default function ProductInquirySection({ inquiries, onVerifyEmail }: ProductInquirySectionProps) {
  return (
    <section className="product-inquiry">
      <div className="product-inquiry__header">
        <button className="product-inquiry__verify" type="button" onClick={onVerifyEmail}>
          이메일 인증하기
        </button>
        <div className="product-inquiry__count">문의 {inquiries.length.toString().padStart(2, '0')}개</div>
      </div>

      <div className="product-inquiry__list">
        {inquiries.map((inquiry) => (
          <InquiryItem key={inquiry.id} inquiry={inquiry} />
        ))}
      </div>
    </section>
  );
}
