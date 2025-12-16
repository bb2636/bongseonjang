import { useMyInquiriesPage } from '../hooks/useMyInquiriesPage';
import MyInquiriesView from '../views/MyInquiriesView';

export default function MyInquiriesPage() {
  const props = useMyInquiriesPage();
  return <MyInquiriesView {...props} />;
}
