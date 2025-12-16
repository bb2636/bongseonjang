import { useNoticeListPage } from '../hooks/useNoticeListPage';
import NoticeListView from '../views/NoticeListView';

export default function NoticeListPage() {
  const { state, actions } = useNoticeListPage();

  return <NoticeListView state={state} actions={actions} />;
}
