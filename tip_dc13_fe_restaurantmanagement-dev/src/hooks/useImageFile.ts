import { useState, useRef, useEffect, useCallback } from "react";
import { validateImageFile, ImageValidationOptions } from "@/utils/image-validation";

export interface UseImageFileOptions extends ImageValidationOptions {
  initialImageUrl?: string | null;
}

export interface UseImageFileReturn {
  selectedFile: File | null;
  previewUrl: string | null;
  fileError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isImageChanged: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveFile: () => void;
  handleRevertFile: () => void;
  setFileError: (error: string | null) => void;
  reset: () => void;
}

export function useImageFile(options?: UseImageFileOptions): UseImageFileReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up object URL on unmount or before creating a new one
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setFileError(null);

      if (!file) return;

      const error = validateImageFile(file, options);
      if (error) {
        setFileError(error);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
    },
    [options, previewUrl]
  );

  const handleRemoveFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  const handleRevertFile = useCallback(() => {
    handleRemoveFile();
  }, [handleRemoveFile]);

  const reset = useCallback(() => {
    handleRemoveFile();
  }, [handleRemoveFile]);

  const isImageChanged = selectedFile !== null;

  return {
    selectedFile,
    previewUrl,
    fileError,
    fileInputRef,
    isImageChanged,
    handleFileChange,
    handleRemoveFile,
    handleRevertFile,
    setFileError,
    reset,
  };
}
