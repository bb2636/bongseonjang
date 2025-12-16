import { useInquiryDetailPage } from '../hooks/useInquiryDetailPage';
import InquiryDetailView from '../views/InquiryDetailView';

export default function InquiryDetailPage() {
  const state = useInquiryDetailPage();

  return <InquiryDetailView state={state} />;
}
