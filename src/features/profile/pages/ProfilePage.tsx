import { useProfilePage } from '../hooks/useProfilePage';
import ProfileView from '../views/ProfileView';

export default function ProfilePage() {
  const { state, actions } = useProfilePage();
  
  return <ProfileView state={state} actions={actions} />;
}
