"use client";

import React from "react";
import Image from "next/image";
import {
  PhotoIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { isDirectUrl } from "@/utils/image-validation";

export interface ImageUploadFieldProps {
  id?: string;
  label?: string;
  previewUrl?: string | null;
  currentImageUrl?: string | null;
  fileError?: string | null;
  disabled?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: () => void;
  onRevert?: () => void;
  uploadPromptText?: string;
  hintText?: string;
}

export function ImageUploadField({
  id = "image-upload-input",
  label = "Hình ảnh",
  previewUrl,
  currentImageUrl,
  fileError,
  disabled = false,
  fileInputRef,
  onFileChange,
  onRemove,
  onRevert,
  uploadPromptText = "Nhấp để tải lên hình ảnh",
  hintText = "Hỗ trợ PNG, JPG, WEBP tối đa 5MB",
}: ImageUploadFieldProps) {
  const hasNewPreview = Boolean(previewUrl);
  const hasExistingImage = Boolean(currentImageUrl);
  const activeImageUrl = previewUrl || currentImageUrl;

  return (
    <div className="space-y-2">
      {label && <label className="rms-field__label block">{label}</label>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        disabled={disabled}
        onChange={onFileChange}
        className="hidden"
      />

      {/* Case 1: Has active image (either new preview or existing image) */}
      {activeImageUrl ? (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center h-56 group">
            <Image
              src={activeImageUrl}
              alt="Hình ảnh hiển thị"
              fill
              unoptimized={isDirectUrl(activeImageUrl)}
              className="object-cover"
            />

            {/* Hover overlay with action buttons */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-xs font-semibold text-gray-800 shadow-sm transition-all cursor-pointer"
              >
                {hasNewPreview ? "Đổi ảnh khác" : "Thay đổi ảnh"}
              </button>

              {/* Remove button (when in create mode or when remove callback is provided) */}
              {hasNewPreview && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={disabled}
                  className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm transition-all cursor-pointer"
                  title="Xóa ảnh"
                  aria-label="Xóa ảnh vừa chọn"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}

              {/* Revert button (when in update mode with new file selected) */}
              {hasNewPreview && hasExistingImage && onRevert && (
                <button
                  type="button"
                  onClick={onRevert}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/90 hover:bg-gray-800 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
                  title="Khôi phục ảnh ban đầu"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  Khôi phục
                </button>
              )}
            </div>

            {/* Badges on image */}
            {hasNewPreview && (
              <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500 text-white shadow-xs">
                {hasExistingImage ? "Ảnh mới sẽ thay thế" : "Ảnh mới"}
              </span>
            )}
            {!hasNewPreview && hasExistingImage && (
              <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-900/60 text-white backdrop-blur-xs">
                Ảnh hiện tại
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Case 2: No image at all -> Upload drop area */
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-rms-burgundy/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-rms-burgundy/[0.02]"
        >
          <div className="w-12 h-12 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mx-auto mb-3">
            <PhotoIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-rms-charcoal mb-1">
            {uploadPromptText}
          </p>
          <p className="text-xs text-gray-400">
            {hintText}
          </p>
        </div>
      )}

      {/* Error message */}
      {fileError && (
        <p className="rms-field__error mt-1.5" role="alert">
          {fileError}
        </p>
      )}
    </div>
  );
}

export default ImageUploadField;
