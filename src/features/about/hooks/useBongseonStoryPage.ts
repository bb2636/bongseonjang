import { useNavigate } from 'react-router-dom';

export function useBongseonStoryPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleHeroAction = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return {
    handleBack,
    handleCartClick,
    handleHeroAction,
  };
}
