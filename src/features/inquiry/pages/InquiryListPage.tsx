import { useInquiryListPage } from '../hooks/useInquiryListPage';
import InquiryListView from '../views/InquiryListView';

export default function InquiryListPage() {
  const state = useInquiryListPage();

  return <InquiryListView state={state} />;
}
