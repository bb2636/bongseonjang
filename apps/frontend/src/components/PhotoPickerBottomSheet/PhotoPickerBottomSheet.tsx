import { useEffect, useRef } from 'react';
import './PhotoPickerBottomSheet.css';

export type PhotoPickerSource = 'gallery' | 'camera' | 'file';

interface PhotoPickerBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (source: PhotoPickerSource) => void;
}

function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

export default function PhotoPickerBottomSheet({
  isOpen,
  onClose,
  onSelect,
}: PhotoPickerBottomSheetProps) {
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

  if (!isOpen) return null;

  const handleSelect = (source: PhotoPickerSource) => {
    onClose();
    onSelect(source);
  };

  return (
    <div className="photo-picker__overlay">
      <div className="photo-picker__sheet" ref={sheetRef}>
        <div className="photo-picker__menu">
          <button
            type="button"
            className="photo-picker__option"
            onClick={() => handleSelect('gallery')}
          >
            <span className="photo-picker__option-icon"><GalleryIcon /></span>
            사진 보관함
          </button>
          <button
            type="button"
            className="photo-picker__option"
            onClick={() => handleSelect('camera')}
          >
            <span className="photo-picker__option-icon"><CameraIcon /></span>
            사진 촬영
          </button>
          <button
            type="button"
            className="photo-picker__option"
            onClick={() => handleSelect('file')}
          >
            <span className="photo-picker__option-icon"><FolderIcon /></span>
            파일 선택
          </button>
        </div>
        <button
          type="button"
          className="photo-picker__cancel"
          onClick={onClose}
        >
          취소
        </button>
      </div>
    </div>
  );
}
