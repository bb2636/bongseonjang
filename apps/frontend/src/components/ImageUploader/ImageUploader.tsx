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
  pickImage?: () => void;
  pickFromCamera?: () => void;
  pickFromGallery?: () => void;
  isCapacitorEnvironment?: boolean;
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

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" stroke="rgba(12, 12, 12, 0.3)" strokeWidth="1.5"/>
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
  handleFileChange,
  removeImage,
  pickImage,
}: ImageUploaderProps) {
  return (
    <div className="image-uploader">
      {hint && <span className="image-uploader__hint">{hint}</span>}
      <div className="image-uploader__list">
        <button
          type="button"
          className="image-uploader__add-btn"
          onClick={pickImage ?? openFilePicker}
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
