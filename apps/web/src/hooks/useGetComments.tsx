import { useQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

export default function useGetComments(postId: number) {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async function () {
      const { data } = await apiManager.getComments(postId);
      return data;
    },
  });
}
