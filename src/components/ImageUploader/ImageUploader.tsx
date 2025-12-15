import { useImageUploader, UploadPurpose, UploadedImage } from '../../hooks/useImageUploader';
import './ImageUploader.css';

interface ImageUploaderProps {
  purpose: UploadPurpose;
  maxImages?: number;
  accept?: string;
  hint?: string;
  onImagesChange?: (images: UploadedImage[]) => void;
  images: UploadedImage[];
  isUploading: boolean;
  canAddMore: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  openFilePicker: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

function ImageUploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5"/>
      <circle cx="8.5" cy="8.5" r="1.5" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5"/>
      <path d="M21 15L16 10L5 21" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function ImageUploader({
  accept = 'image/jpeg,image/png',
  hint,
  images,
  isUploading,
  canAddMore,
  fileInputRef,
  openFilePicker,
  handleFileChange,
  removeImage,
}: ImageUploaderProps) {
  return (
    <div className="image-uploader">
      {hint && <span className="image-uploader__hint">{hint}</span>}
      <div className="image-uploader__list">
        <button
          type="button"
          className="image-uploader__add-btn"
          onClick={openFilePicker}
          disabled={!canAddMore || isUploading}
        >
          <ImageUploadIcon />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileChange}
          className="image-uploader__file-input"
        />
        {images.map((image, index) => (
          <div key={index} className="image-uploader__preview">
            <img src={image.previewUrl} alt={`미리보기 ${index + 1}`} />
            {image.isUploading && (
              <div className="image-uploader__uploading">
                <div className="image-uploader__spinner" />
              </div>
            )}
            {image.error && (
              <div className="image-uploader__error-badge" title={image.error}>!</div>
            )}
            <button
              type="button"
              className="image-uploader__remove-btn"
              onClick={() => removeImage(index)}
              disabled={image.isUploading}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export { useImageUploader };
export type { UploadPurpose, UploadedImage };
