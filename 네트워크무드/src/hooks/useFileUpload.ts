import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile } from '@/services/api';
import { FileUploadResponse } from '@/types';

/**
 * 파일 업로드를 위한 React Query Mutation Hook
 */
export const useFileUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      return uploadFile(file, (progress) => {
        // 진행률은 컴포넌트에서 처리
        console.log(`Upload progress: ${progress}%`);
      });
    },
    onSuccess: (data) => {
      // 업로드 성공 시 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['analysis'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
};

