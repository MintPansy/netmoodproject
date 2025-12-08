'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '@/services/api';
import { FileUploadResponse } from '@/types';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as styles from './FileUpload.css';

interface FileUploadProps {
  onUploadSuccess?: (response: FileUploadResponse) => void;
  onUploadError?: (error: Error) => void;
  accept?: string;
  maxSize?: number; // bytes
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  accept = '.csv',
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadFile(file, (progress) => {
        // 진행률 업데이트 (필요시)
        console.log(`Upload progress: ${progress}%`);
      });
    },
    onSuccess: (data) => {
      setError(null);
      onUploadSuccess?.(data);
    },
    onError: (err: Error) => {
      const errorMessage = err.message || '파일 업로드에 실패했습니다.';
      setError(errorMessage);
      setShowErrorDialog(true);
      onUploadError?.(err);
    },
  });

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `파일 크기가 너무 큽니다. 최대 ${maxSize / 1024 / 1024}MB까지 업로드 가능합니다.`;
    }

    if (accept && !file.name.match(new RegExp(accept.replace('.', '\\.')))) {
      return `지원하지 않는 파일 형식입니다. ${accept} 파일만 업로드 가능합니다.`;
    }

    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setShowErrorDialog(true);
        return;
      }

      uploadMutation.mutate(file);
    },
    [uploadMutation, accept, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <>
      <div
        className={`${styles.container} ${isDragging ? styles.dragging : ''} ${
          uploadMutation.isPending ? styles.uploading : ''
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className={styles.input}
          disabled={uploadMutation.isPending}
        />

        <div className={styles.content}>
          {uploadMutation.isPending ? (
            <>
              <div className={styles.spinner} />
              <p className={styles.text}>업로드 중...</p>
              <p className={styles.subtext}>
                진행률: {uploadMutation.variables ? '처리 중...' : '0'}%
              </p>
            </>
          ) : (
            <>
              <div className={styles.icon}>📁</div>
              <p className={styles.text}>
                파일을 드래그하여 놓거나 클릭하여 선택하세요
              </p>
              <p className={styles.subtext}>
                CSV 파일 (최대 {maxSize / 1024 / 1024}MB)
              </p>
            </>
          )}
        </div>
      </div>

      <AlertDialog.Root open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className={styles.overlay} />
          <AlertDialog.Content className={styles.dialogContent}>
            <AlertDialog.Title className={styles.dialogTitle}>
              업로드 오류
            </AlertDialog.Title>
            <AlertDialog.Description className={styles.dialogDescription}>
              {error || '알 수 없는 오류가 발생했습니다.'}
            </AlertDialog.Description>
            <div className={styles.dialogActions}>
              <AlertDialog.Cancel asChild>
                <button className={styles.dialogButton}>확인</button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

