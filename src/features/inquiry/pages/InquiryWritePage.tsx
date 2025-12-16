import { useInquiryWritePage } from '../hooks/useInquiryWritePage';
import InquiryWriteView from '../views/InquiryWriteView';

export default function InquiryWritePage() {
  const state = useInquiryWritePage();

  return <InquiryWriteView state={state} />;
}
