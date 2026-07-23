import { useInfiniteQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

const LIMIT = 9;

export default function useGetPosts() {
  return useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data } = await apiManager.getPosts({ page: pageParam, limit: LIMIT });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}
