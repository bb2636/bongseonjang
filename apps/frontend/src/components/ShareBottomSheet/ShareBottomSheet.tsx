import { useEffect, useRef } from 'react';
import { Share } from '@capacitor/share';
import { checkIsCapacitor } from '@/shared/config/apiConfig';
import './ShareBottomSheet.css';

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  shareUrl: string;
  onCopyLink: () => void;
}

export default function ShareBottomSheet({
  isOpen,
  onClose,
  productName,
  shareUrl,
  onCopyLink,
}: ShareBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleKakaoShare = () => {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
    if (!kakaoKey) {
      console.error('Kakao JS Key not found');
      onCopyLink();
      return;
    }

    if (typeof window !== 'undefined' && (window as unknown as { Kakao?: { isInitialized: () => boolean; Share: { sendDefault: (config: object) => void } } }).Kakao) {
      const Kakao = (window as unknown as { Kakao: { isInitialized: () => boolean; Share: { sendDefault: (config: object) => void } } }).Kakao;
      if (!Kakao.isInitialized()) {
        console.error('Kakao SDK not initialized');
        onCopyLink();
        return;
      }

      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: productName || '봉선장 상품',
          description: '봉선장에서 상품을 확인해보세요!',
          imageUrl: 'https://bongseonjang.replit.app/logo.png',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '상품 보기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
      onClose();
    } else {
      onCopyLink();
    }
  };

  const handleNaverShare = () => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(productName || '봉선장 상품');
    const naverShareUrl = `https://share.naver.com/web/shareView?url=${encodedUrl}&title=${encodedTitle}`;
    window.open(naverShareUrl, '_blank', 'width=500,height=600');
    onClose();
  };

  const handleCopyLink = () => {
    onCopyLink();
    onClose();
  };

  const handleNativeShare = async () => {
    const isCapacitor = checkIsCapacitor();
    
    if (isCapacitor) {
      try {
        await Share.share({
          title: productName || '봉선장 상품',
          text: '봉선장에서 상품을 확인해보세요!',
          url: shareUrl,
          dialogTitle: '공유하기',
        });
        onClose();
      } catch (err) {
        console.error('[Share] Native share failed:', err);
        onCopyLink();
      }
    } else {
      if (navigator.share) {
        try {
          await navigator.share({
            title: productName || '봉선장 상품',
            text: '봉선장에서 상품을 확인해보세요!',
            url: shareUrl,
          });
          onClose();
        } catch (err) {
          console.error('[Share] Web share failed:', err);
          onCopyLink();
        }
      } else {
        onCopyLink();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="share-bottom-sheet__overlay">
      <div className="share-bottom-sheet" ref={sheetRef}>
        <div className="share-bottom-sheet__header">
          <span className="share-bottom-sheet__title">공유하기</span>
          <button className="share-bottom-sheet__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="share-bottom-sheet__options">
          <button className="share-bottom-sheet__option" onClick={handleKakaoShare}>
            <div className="share-bottom-sheet__icon share-bottom-sheet__icon--kakao">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 3C6.48 3 2 6.58 2 11C2 13.84 3.96 16.32 6.96 17.68L5.76 21.52C5.68 21.8 5.96 22.04 6.2 21.88L10.8 18.84C11.2 18.88 11.6 18.92 12 18.92C17.52 18.92 22 15.34 22 10.92C22 6.5 17.52 3 12 3Z" fill="#3C1E1E"/>
              </svg>
            </div>
            <span>카카오톡</span>
          </button>
          
          <button className="share-bottom-sheet__option" onClick={handleNaverShare}>
            <div className="share-bottom-sheet__icon share-bottom-sheet__icon--naver">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M16.27 12.5L7.53 3H3V21H7.73V11.5L16.47 21H21V3H16.27V12.5Z" fill="white"/>
              </svg>
            </div>
            <span>네이버</span>
          </button>
          
          <button className="share-bottom-sheet__option" onClick={handleCopyLink}>
            <div className="share-bottom-sheet__icon share-bottom-sheet__icon--link">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.479 3.53087C19.5519 2.60383 18.2979 2.07799 16.9869 2.0666C15.6759 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11C13.5705 10.4259 13.0226 9.9509 12.3934 9.60707C11.7643 9.26324 11.0685 9.05886 10.3534 9.00765C9.63821 8.95643 8.92041 9.05963 8.24866 9.3102C7.57691 9.56077 6.96689 9.95296 6.46 10.46L3.46 13.46C2.54918 14.403 2.04519 15.666 2.05659 16.977C2.06799 18.288 2.59383 19.5421 3.52087 20.4691C4.44791 21.3961 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>링크 복사</span>
          </button>
          
          <button className="share-bottom-sheet__option" onClick={handleNativeShare}>
            <div className="share-bottom-sheet__icon share-bottom-sheet__icon--more">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="1" fill="currentColor"/>
                <circle cx="19" cy="12" r="1" fill="currentColor"/>
                <circle cx="5" cy="12" r="1" fill="currentColor"/>
              </svg>
            </div>
            <span>더보기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
