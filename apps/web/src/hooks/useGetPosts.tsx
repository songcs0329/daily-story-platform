import { useQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

export default function useGetPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async function () {
      const { data } = await apiManager.getPosts();
      return data;
    },
  });
}
