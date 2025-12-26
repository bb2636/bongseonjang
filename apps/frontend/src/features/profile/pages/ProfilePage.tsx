import ProfileView from '../views/ProfileView';
import GuestProfileView from '../views/GuestProfileView';
import { useProfilePage } from '../hooks/useProfilePage';

function AuthenticatedProfilePage() {
  const { state, actions } = useProfilePage();
  return <ProfileView state={state} actions={actions} />;
}

export default function ProfilePage() {
  const isLoggedIn = !!localStorage.getItem('token');
  
  if (!isLoggedIn) {
    return <GuestProfileView />;
  }

  return <AuthenticatedProfilePage />;
}
