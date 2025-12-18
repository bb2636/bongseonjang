import { useMyInquiriesPage } from '../hooks/useMyInquiriesPage';
import MyInquiriesView from '../views/MyInquiriesView';

export default function MyInquiriesPage() {
  const { state, actions } = useMyInquiriesPage();
  return <MyInquiriesView state={state} actions={actions} />;
}
