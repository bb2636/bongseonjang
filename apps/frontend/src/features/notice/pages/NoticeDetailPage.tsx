import { useNoticeDetailPage } from '../hooks/useNoticeDetailPage';
import NoticeDetailView from '../views/NoticeDetailView';

export default function NoticeDetailPage() {
  const { state, actions } = useNoticeDetailPage();

  return <NoticeDetailView state={state} actions={actions} />;
}
