import type { Comment, Paginated, Post, User } from 'shared';
import restClient from '@/libs/apis/restClient';

const apiManager = {
  getPosts: async (params?: { page?: number; limit?: number }) => {
    return await restClient.get<Paginated<Post>>('/posts', params);
  },
  getPost: async (postId: number) => {
    return await restClient.get<Post>(`/posts/${postId}`);
  },
  kakaoLogin: async (kakaoAccessToken: string) => {
    return await restClient.post<{ accessToken: string; user: User }>('/auth/kakao/login', {
      kakaoAccessToken,
    });
  },
  getComments: async (postId: number) => {
    return await restClient.get<Comment[]>(`/posts/${postId}/comments`);
  },
  createComment: async (postId: number, content: string) => {
    return await restClient.post<Comment>(`/posts/${postId}/comments`, { content });
  },
  deleteComment: async (commentId: number) => {
    return await restClient.delete<void>(`/comments/${commentId}`);
  },
};

export default apiManager;
