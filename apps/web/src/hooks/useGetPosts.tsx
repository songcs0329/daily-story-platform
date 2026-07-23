import { useQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

export default function useGetPosts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['posts', params?.page, params?.limit],
    queryFn: async function () {
      const { data } = await apiManager.getPosts(params);
      return data;
    },
  });
}
