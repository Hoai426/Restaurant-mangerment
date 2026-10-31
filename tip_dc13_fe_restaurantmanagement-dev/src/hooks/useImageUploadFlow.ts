import { useState, useCallback } from "react";

export interface UseImageUploadFlowOptions {
  uploadFn: (file: File) => Promise<string>;
}

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: Error;
}

export interface UseImageUploadFlowReturn {
  isUploading: boolean;
  uploadImageFile: (file: File | null) => Promise<ImageUploadResult>;
}

export function useImageUploadFlow({
  uploadFn,
}: UseImageUploadFlowOptions): UseImageUploadFlowReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const uploadImageFile = useCallback(
    async (file: File | null): Promise<ImageUploadResult> => {
      if (!file) {
        return { success: true };
      }

      try {
        setIsUploading(true);
        const imageUrl = await uploadFn(file);
        return { success: true, imageUrl };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err : new Error(String(err)),
        };
      } finally {
        setIsUploading(false);
      }
    },
    [uploadFn]
  );

  return {
    isUploading,
    uploadImageFile,
  };
}

export default useImageUploadFlow;
