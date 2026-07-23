import type { Paginated, Post } from 'shared';
import restClient from '@/libs/apis/restClient';

const apiManager = {
  getPosts: async (params?: { page?: number; limit?: number }) => {
    return await restClient.get<Paginated<Post>>('/posts', params);
  },
  getPost: async (postId: number) => {
    return await restClient.get<Post>(`/posts/${postId}`);
  },
};

export default apiManager;
