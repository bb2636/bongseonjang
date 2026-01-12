import loadingImage from '../../assets/loading.png';
import './HomePageSkeleton.css';

export function HomePageSkeleton() {
  return (
    <div className="home-skeleton">
      <img 
        src={loadingImage} 
        alt="로딩 중" 
        className="home-skeleton__loading-image"
      />
    </div>
  );
}

export default HomePageSkeleton;
