import { usePointPage } from '../hooks/usePointPage';
import PointView from '../views/PointView';

export default function PointPage() {
  const { state, actions } = usePointPage();
  
  return <PointView state={state} actions={actions} />;
}
