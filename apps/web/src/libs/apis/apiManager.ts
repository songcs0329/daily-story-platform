import restClient from '@/libs/apis/restClient';

const apiManager = {
  getTodo: async (todoId: number) => {
    return await restClient.get<ApiResponse.GetTodoResponse>(`/todos/${todoId}`);
  },
};

export default apiManager;
