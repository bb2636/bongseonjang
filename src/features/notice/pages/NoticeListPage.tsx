import { useNoticeListPage } from '../hooks/useNoticeListPage';
import NoticeListView from '../views/NoticeListView';

export default function NoticeListPage() {
  const state = useNoticeListPage();

  return <NoticeListView state={state} />;
}
