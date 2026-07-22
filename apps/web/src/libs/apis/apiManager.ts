import type { Post } from 'shared';
import restClient from '@/libs/apis/restClient';

const apiManager = {
  getPosts: async () => {
    return await restClient.get<Post[]>('/posts');
  },
  getPost: async (postId: number) => {
    return await restClient.get<Post>(`/posts/${postId}`);
  },
};

export default apiManager;
