import { useQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

export default function useGetPost(postId: number | undefined) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async function () {
      const { data } = await apiManager.getPost(postId!);
      return data;
    },
    enabled: !!postId,
  });
}
