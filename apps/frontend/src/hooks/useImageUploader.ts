import { useState, useRef, useCallback } from 'react';

export type UploadPurpose = 'review' | 'inquiry' | 'profile' | 'support';

export interface UploadedImage {
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  isUploading: boolean;
  error?: string;
}

interface UseImageUploaderOptions {
  purpose: UploadPurpose;
  maxImages?: number;
  onUploadComplete?: (images: UploadedImage[]) => void;
}

function getUploadEndpoint(): string {
  return '/api/upload';
}

function getExtensionFromFile(file: File): string {
  const nameParts = file.name.split('.');
  if (nameParts.length > 1) {
    return nameParts.pop()!.toLowerCase();
  }
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return mimeToExt[file.type] || 'bin';
}

async function uploadImageToServer(file: File, purpose: UploadPurpose): Promise<string> {
  const token = localStorage.getItem('user_token');
  const formData = new FormData();
  formData.append('image', file);
  formData.append('purpose', purpose);

  const endpoint = getUploadEndpoint();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '이미지 업로드에 실패했습니다.');
  }

  const data = await response.json();
  return data.objectPath;
}

export function useImageUploader(options: UseImageUploaderOptions) {
  const { purpose, maxImages = 10, onUploadComplete } = options;
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const remainingSlots = maxImages - images.length;
      const newFiles = Array.from(files).slice(0, remainingSlots);
      if (newFiles.length === 0) return;

      const newImages: UploadedImage[] = newFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isUploading: true,
      }));

      setImages((prev) => [...prev, ...newImages]);
      setIsUploading(true);
      event.target.value = '';

      for (const file of newFiles) {
        try {
          const objectPath = await uploadImageToServer(file, purpose);

          setImages((prev) =>
            prev.map((img) =>
              img.file === file
                ? { ...img, uploadedUrl: objectPath, isUploading: false }
                : img
            )
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '업로드 실패';
          setImages((prev) =>
            prev.map((img) =>
              img.file === file
                ? { ...img, isUploading: false, error: errorMessage }
                : img
            )
          );
        }
      }

      setIsUploading(false);
      onUploadComplete?.(images);
    },
    [images, maxImages, purpose, onUploadComplete]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clearImages = useCallback(() => {
    images.forEach((img) => {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl);
      }
    });
    setImages([]);
  }, [images]);

  const getUploadedUrls = useCallback((): string[] => {
    return images
      .filter((img) => img.uploadedUrl && !img.error)
      .map((img) => img.uploadedUrl!);
  }, [images]);

  const hasUploadingImages = images.some((img) => img.isUploading);
  const canAddMore = images.length < maxImages;

  return {
    images,
    isUploading,
    hasUploadingImages,
    canAddMore,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    removeImage,
    clearImages,
    getUploadedUrls,
  };
}
