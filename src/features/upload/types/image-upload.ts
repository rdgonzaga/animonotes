export interface ImageUploadProps {
  onUpload: (url: string) => void;
  onRemove?: () => void;
  currentUrl?: string;
}
