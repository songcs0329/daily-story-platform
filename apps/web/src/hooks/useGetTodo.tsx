import { useQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

export default function useGetTodo(todoId: number | undefined) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: async function () {
      const { data } = await apiManager.getTodo(todoId!);
      return data;
    },
    enabled: !!todoId,
  });
}
