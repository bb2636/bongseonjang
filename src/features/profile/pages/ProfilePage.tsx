import { useProfilePage } from '../hooks/useProfilePage';
import ProfileView from '../views/ProfileView';

export default function ProfilePage() {
  const state = useProfilePage();
  
  return <ProfileView state={state} />;
}
